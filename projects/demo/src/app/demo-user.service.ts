import { Injectable, signal } from '@angular/core';

/** Demo-only mock auth: switch role/user to exercise audience targeting + audit. */
@Injectable({ providedIn: 'root' })
export class DemoUser {
  readonly userId = signal('alice');
  readonly roles = signal<string[]>(['admin']);
}
