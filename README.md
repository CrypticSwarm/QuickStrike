Quick-Strike
============

Quick Strike provides connections to Knockout to real time backends.  Currently implemented backends are Simperium and ShareJS.

## Rational

Realtime backends allow data to be synced up between many clients.  Often a lot of code is sacrifised to wiring up events to html changes and vice versa. Quick Strike takes a declarative approach.  You declare what data you want to be synced up and it wires up the events from the backend to knockout to form a bidirectional pipeline from a local users view directly to remote users views.
