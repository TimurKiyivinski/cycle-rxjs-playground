import { Observable } from 'rxjs';
import { VNode } from '@cycle/dom';
import { DOMSource } from '@cycle/dom/lib/cjs/rxjs';
import { Reducer } from '@cycle/state';
import { HistoryAction } from 'cyclic-router';
import { RouterSource } from 'cyclic-router/rxjs-typings';

// Exports
export { DOMSource } from '@cycle/dom/lib/cjs/rxjs';
export { Reducer } from '@cycle/state';
// @cycle/state does not have an RXJS version
export interface StateSource<S> {
    stream: Observable<S>;
}

export type Component<State> = (s: Sources<State>) => Sinks<State>;

export interface Sources<State> {
    DOM: DOMSource;
    router: RouterSource;
    state: StateSource<State>;
}

export interface Sinks<State> {
    DOM?: Observable<VNode>;
    router?: Observable<HistoryAction>;
    speech?: Observable<string>;
    state?: Observable<Reducer<State>>;
}
