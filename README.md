Signal K MOB notifier plugin
============================

This plugin detects if Signal K has seen an AIS MOB (MMSI starting with `972`), EPIRB (MMSI starting with `974`), or SART (MMSI starting with `970`) beacon. If a beacon is detected, a [Signal K notification](https://signalk.org/specification/1.5.0/doc/notifications.html) will be raised. With the notification there are various ways to alert the crew:

* Audio with plugins like [signalk-audio-notifications](https://github.com/meri-imperiumi/signalk-audio-notifications) and an attached speaker
* Meshtastic message with [signalk-meshtastic](https://github.com/meri-imperiumi/signalk-meshtastic)
* Visual with apps like Freeboard

Please note that this plugin aims to aid with noticing and locating crew overboard. It is not a replacement for "proper" alerting mechanisms via dedicated alert buzzers, chartplotters, or a VHF radio.

## Changes

* 1.1.6 (2026-01-20)
  - Round distance to beacon with single decimal
  - Use EPIRB and SART terms for shorter notifications
* 1.1.5 (2025-11-15)
  - Bump release
* 1.1.4 (2025-11-12)
  - Fix reading MOB vessel data structure
* 1.1.3 (2025-11-02)
  - Fix detection of beacon type (MOB/SART/EPIRB)
* 1.1.2 (2025-11-01)
  - Better approach at getting MOB coordinates
* 1.1.1 (2025-09-18)
  - Notifications include position when available
* 1.1.0 (2025-09-04)
  - Notification is not re-published if it already exists
* 1.0.0 (2025-08-25)
  - Initial release
