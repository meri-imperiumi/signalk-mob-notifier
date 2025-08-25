Signal K MOB notifier plugin
============================

This plugin detects if Signal K has seen an AIS MOB beacon (MMSI starting with `972`). If a MOB beacon is detected, a [Signal K notification](https://signalk.org/specification/1.5.0/doc/notifications.html) will be raised. With the notification there are various ways to alert crew of a MOB:

* Audio with plugins like [signalk-audio-notifications](https://github.com/meri-imperiumi/signalk-audio-notifications) and an attached speaker
* Meshtastic message with [signalk-meshtastic](https://github.com/meri-imperiumi/signalk-meshtastic)
* Visual with apps like Freeboard

Please note that this plugin aims to aid with noticing and locating crew overboard. It is not a replacement for "proper" alerting mechanisms via dedicated alert buzzers, chartplotters, or a VHF radio.
