# Changelog

## [Unreleased]

## [1.1.8] - 2026-10-05
### Changed
- Bump the `where` dependency to `^0.4.3`, which normalizes its bearing/direction longitude delta across the antimeridian (the upstream fix). The MOB message's distance and direction were already seam-safe — the haversine and bearing trig folds the seam — so this is a stay-current bump, pinning the upstream antimeridian-hardened version

## [1.1.7] - 2026-06-16
### Added
- Added application icon

## [1.1.6] - 2026-01-20
### Changed
- Round distance to beacon with single decimal
- Use EPIRB and SART terms for shorter notifications

## [1.1.5] - 2025-11-15
### Changed
- Bump release

## [1.1.4] - 2025-11-12
### Fixed
- Fix reading MOB vessel data structure

## [1.1.3] - 2025-11-02
### Fixed
- Fix detection of beacon type (MOB/SART/EPIRB)

## [1.1.2] - 2025-11-01
### Fixed
- Better approach at getting MOB coordinates

## [1.1.1] - 2025-09-18
### Changed
- Notifications include position when available

## [1.1.0] - 2025-09-04
### Changed
- Notification is not re-published if it already exists

## [1.0.0] - 2025-08-25
### Added
- Initial release
