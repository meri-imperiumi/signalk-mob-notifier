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
  plugin.description = 'Create notifications for discovered AIS MOB beacons';

  plugin.start = (settings) => {
    interval = setInterval(() => {
      // Check context for MOBs
      const mobs = Object.keys(app.signalk.vessels)
        .filter((context) => {
          const mmsi = context.split(':').at(-1);
          if (mmsi.indexOf('972') === 0) {
            // MOB beacon seen!
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
          app.handleMessage('signalk-meshtastic', {
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

      if (mobs.length === 0) {
        // TODO: Clear notifications
        return;
      }
      mobs.forEach((mmsi) => {
        let message = 'Crew Overboard Beacon detected';
        // For each MOB get direction and range
        const ownPosition = app.getSelfPath('navigation.position');
        const mobPosition = app.getPath(`vessels.urn:mrn:imo:mmsi:${mmsi}.navigation.position`);
        if (ownPosition && mobPosition) {
          const me = new Point(ownPosition.latitude, ownPosition.longitude);
          const they = new Point(mobPosition.latitude, mobPosition.longitude);
          const distance = me.distanceTo(they, 'K') * 1000; // In meters
          const direction = longDirection(me.directionTo(they));
          message = `${message} ${distance} meters to ${direction}`;
        }

        // Raise notification
        app.handleMessage('signalk-meshtastic', {
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
        default: 5,
        title: 'How often to check for MOB Beacons (in seconds)?',
      },
    },
  };

  return plugin;
};
