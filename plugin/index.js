const { Point } = require('where');

function longDirection(direction) {
  switch (direction) {
    case 'N': {
      return 'north';
    }
    case 'NE': {
      return 'northeast';
    }
    case 'E': {
      return 'east';
    }
    case 'SE': {
      return 'southeast';
    }
    case 'S': {
      return 'south';
    }
    case 'SW': {
      return 'southwest';
    }
    case 'W': {
      return 'west';
    }
    case 'NW': {
      return 'northwest';
    }
    default: {
      return 'unknown';
    }
  }
}

module.exports = (app) => {
  const plugin = {};
  let interval;
  const notified = [];
  plugin.id = 'signalk-mob-notifier';
  plugin.name = 'MOB Beacon Notifier';
  plugin.description = 'Create notifications for discovered AIS MOB, EPIRB, and SART beacons';

  plugin.start = (settings) => {
    interval = setInterval(() => {
      // Check context for MOBs
      const mobs = Object.keys(app.signalk.root.vessels)
        .filter((context) => {
          const mmsi = context.split(':').at(-1);
          if (mmsi.indexOf('972') === 0) {
            // MOB beacon seen!
            return true;
          }
          if (mmsi.indexOf('970') === 0) {
            // SART beacon seen!
            return true;
          }
          if (mmsi.indexOf('974') === 0) {
            // EPIRB seen!
            return true;
          }
          return false;
        });

      // Clear notifications as needed
      notified
        .filter((mmsi) => {
          if (mobs.indexOf(mmsi) !== -1) {
            // This beacon is still active
            return false;
          }
          return true;
        })
        .forEach((mmsi) => {
          app.handleMessage('signalk-mob-notifier', {
            context: `vessels.${app.selfId}`,
            updates: [
              {
                source: {
                  label: plugin.id,
                },
                timestamp: (new Date().toISOString()),
                values: [
                  {
                    path: `notifications.mob.${mmsi}`,
                    value: null,
                  },
                ],
              },
            ],
          });
          notified.splice(notified.indexOf(mmsi), 1);
        });

      app.setPluginStatus(`${mobs.length} MOB, EPIRB, or SART beacons detected`);

      if (mobs.length === 0) {
        return;
      }
      mobs.forEach((mmsi) => {
        // Check if we already have a notification for this one
        const notification = app.getSelfPath(`notifications.mob.${mmsi}`);
        if (notification) {
          return;
        }
        let message = 'Crew Overboard Beacon detected';
        if (String(mmsi).indexOf('970') === 0) {
          message = 'Search and Rescue Transponder Beacon detected';
        }
        if (String(mmsi).indexOf('974') === 0) {
          message = 'Emergency Position Indicating Beacon detected';
        }
        // For each MOB get direction and range
        const getCoordinates = (v) => {
          if (Number.isFinite(v.latitude)) {
            return v;
          }
          if (v.value && Number.isFinite(v.value.latitude)) {
            return v.value;
          }
          return {};
        };
        const ownPosition = getCoordinates(app.getSelfPath('navigation.position'));
        const mob = app.getPath(`vessels.urn:mrn:imo:mmsi:${mmsi}`);
        let mobPosition = {};
        if (mob.navigation && mob.navigation.position) {
          mobPosition = getCoordinates(mob.navigation.position);
        }
        if (ownPosition
          && Number.isFinite(ownPosition.latitude)
          && mobPosition
          && Number.isFinite(mobPosition.latitude)) {
          const me = new Point(ownPosition.latitude, ownPosition.longitude);
          const they = new Point(mobPosition.latitude, mobPosition.longitude);
          const distance = me.distanceTo(they, 'K') * 1000; // In meters
          const direction = longDirection(me.directionTo(they));
          message = `${message} ${distance} meters to ${direction}`;
        }

        // Raise notification
        app.handleMessage('signalk-mob-notifier', {
          context: `vessels.${app.selfId}`,
          updates: [
            {
              source: {
                label: plugin.id,
              },
              timestamp: (new Date().toISOString()),
              values: [
                {
                  path: `notifications.mob.${mmsi}`,
                  value: {
                    message,
                    position: mobPosition || null,
                    data: {
                      mmsi,
                    },
                    state: 'emergency',
                    method: ['visual', 'sound'],
                  },
                },
              ],
            },
          ],
        });
        notified.push(mmsi);
      });
    }, settings.interval * 1000);
  };

  plugin.stop = () => {
    if (!interval) {
      return;
    }
    clearInterval(interval);
    interval = undefined;
  };

  plugin.schema = {
    type: 'object',
    properties: {
      interval: {
        type: 'integer',
        default: 30,
        title: 'How often to check for Beacons (in seconds)?',
      },
    },
  };

  return plugin;
};
