# Older changes
## 0.0.11 (2026-04-06)

- TypeScript updated to 6.0
- Some dependency work

## 0.0.10 (2026-03-15)

- Auto PRs merged
- Some dependency work
- Tests extended
- Copyright year updated

## 0.0.9 (2025-12-01)

- Some dependency work
- Avoid warning messages, if the received protocol does not contain values to update the ioBroker states (Issue #91)

## 0.0.8 (2025-10-16)

- Some dependency work
- Issues from adapter checker fixed

## 0.0.7 (2025-07-01)

- Some dependency work
- Code documentation extended
- Added Node.js 24 to test and release pipeline
- Resending interval of not overtaken values changed from 1,5 seconds to 2,5 seconds
- Changed writable mixed numerical/string values for enums into selectable values, to show available configurations (**breaking change** if already used to remote control fans)
- Rewrite mechanism allows now manual changes within the buttons of the fan, which were overridden by the internal stored value before

## 0.0.6 (2025-04-17)

- Vulnerable dependency updated

## 0.0.5 (2025-03-21)

- Added automatic write retry mechanism for writing values within the fan, as writing with UDP is not very reliable in connection with poor network conditions
- Adapter checker issues fixed

## 0.0.4 (2025-01-31)

- Updated ESLint to 9.x.x
- Fixed copyright issue from adapter checker
- Replaced deletion of all objects with deletion of missing devices from config only
- Avoided illegal characters from user input for fan id within code
- Changed state subscription to all states below the devices folder
- Added restart logic of UDP server in case of an error
- Added adapter terminiation if multiple udp server errors occured
- Replaced cyclic checking of the send quene with a timeout approach instead of interval
- Missing intermediate objects created
- Roles updated according to the read/write definitions
- Polling interval limited in JSON config and code
- ioBroker unit in object tree for RTC date & time removed

## 0.0.3 (2025-01-11)

- Added states for objects with high byte 0x03 with reading and writing
- Recreate device objects on adapter restart
- Simplified methods for writing fan data based on subscribed states
- Added a first unit test for the parsing of numbers.

## 0.0.2 (2025-01-06)

- (N-b-dy) initial release

[Older changelogs can be found there](CHANGELOG_OLD.md)
