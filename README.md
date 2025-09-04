Signal K MOB notifier plugin
============================

This plugin detects if Signal K has seen an AIS MOB (MMSI starting with `972`), EPIRB (MMSI starting with `974`), or SART (MMSI starting with `970`) beacon. If a beacon is detected, a [Signal K notification](https://signalk.org/specification/1.5.0/doc/notifications.html) will be raised. With the notification there are various ways to alert the crew:

* Audio with plugins like [signalk-audio-notifications](https://github.com/meri-imperiumi/signalk-audio-notifications) and an attached speaker
* Meshtastic message with [signalk-meshtastic](https://github.com/meri-imperiumi/signalk-meshtastic)
* Visual with apps like Freeboard

Please note that this plugin aims to aid with noticing and locating crew overboard. It is not a replacement for "proper" alerting mechanisms via dedicated alert buzzers, chartplotters, or a VHF radio.

## Changes

* 1.1.0 (2025-09-04)
  - Notification is not re-published if it already exists
* 1.0.0 (2025-08-25)
  - Initial release
