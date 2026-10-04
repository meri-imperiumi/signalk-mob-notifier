const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const pluginFactory = require('../plugin/index');

describe('plugin', () => {
  const app = { debug: () => {}, error: () => {} };
  const plugin = pluginFactory(app);

  it('has required interface', () => {
    assert.equal(typeof plugin.start, 'function');
    assert.equal(typeof plugin.stop, 'function');
    assert.ok(plugin.id);
  });

  it('starts and stops without error', () => {
    plugin.start({}, () => {});
    plugin.stop();
  });
});

describe('MOB message across the antimeridian', () => {
  it('reports the short-way distance and direction across 180°', () => {
    // Vessel just east of the antimeridian, MOB beacon just west of it:
    // the beacon is ~22 km east (over the seam), not half a world away.
    const messages = [];
    const statuses = [];
    const raised = {};
    const app = {
      debug: () => {},
      error: () => {},
      selfId: 'urn:mrn:imo:mmsi:230099999',
      getSelfPath: (path) => {
        if (path === 'navigation.position') {
          return { latitude: -14, longitude: 179.9 };
        }
        // The plugin dedups against the live notification subtree
        return raised[path] ? { value: raised[path] } : undefined;
      },
      signalk: {
        root: {
          vessels: {
            'urn:mrn:imo:mmsi:972123456': {
              navigation: {
                position: { value: { latitude: -14, longitude: -179.9 } },
              },
            },
          },
        },
      },
      setPluginStatus: (s) => statuses.push(s),
      handleMessage: (source, delta) => {
        messages.push(delta);
        delta.updates.forEach((u) => u.values.forEach((v) => {
          if (v.path.startsWith('notifications.mob.') && v.value) {
            raised[v.path] = v.value;
          }
        }));
      },
    };
    const plugin = pluginFactory(app);
    plugin.start({ interval: 0.01 });
    return new Promise((resolve) => {
      setTimeout(() => {
        plugin.stop();
        const notifications = messages
          .flatMap((d) => d.updates)
          .flatMap((u) => u.values)
          .filter((v) => v.path.startsWith('notifications.mob.'));
        assert.equal(notifications.length, 1, 'one MOB notification raised');
        const { message } = notifications[0].value;
        const meters = Number(message.match(/([\d.]+) meters/)[1]);
        assert.ok(
          meters > 20000 && meters < 24000,
          `distance ${meters} m; expected ~22 km over the seam`,
        );
        assert.ok(
          /to (east|southeast|northeast)/.test(message),
          `direction in "${message}" should read across the seam as east`,
        );
        resolve();
      }, 50);
    });
  });
});
