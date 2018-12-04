import {
    merge as observableMerge,
    Observable,
    MonoTypeOperatorFunction
} from 'rxjs';
import { map, mapTo, filter, switchAll } from 'rxjs/operators';
import { VNode } from '@cycle/dom';
import { extractSinks } from 'cyclejs-utils';
import isolate from '@cycle/isolate';

import { Sources, Sinks, Reducer, DOMSource, Component } from '../interfaces';

import { Counter, State as CounterState } from './counter';
import { Speaker, State as SpeakerState } from './speaker';

export interface State {
    counter?: CounterState;
    speaker?: SpeakerState;
}

function extractSink(sink: string): MonoTypeOperatorFunction<any> {
    return (sink$: Observable<any>): Observable<any> =>
        sink$.pipe(
            map((s: any) => s[sink]),
            filter((s: any) => !!s),
            switchAll()
        );
}

export function App(sources: Sources<State>): Sinks<State> {
    const match$ = sources.router.define({
        '/counter': isolate(Counter, 'counter'),
        '/speaker': isolate(Speaker, 'speaker')
    });

    const componentSinks$: Observable<Sinks<State>> = match$.pipe(
        filter(({ path, value }: any) => path && typeof value === 'function'),
        map(({ path, value }: { path: string; value: Component<any> }) => {
            return value({
                ...sources,
                router: sources.router.path(path)
            });
        })
    );

    const redirect$: Observable<string> = sources.router.history$.pipe(
        filter(l => l.pathname === '/'),
        mapTo('/counter')
    );

    return {
        DOM: componentSinks$.pipe(extractSink('DOM')),
        speech: componentSinks$.pipe(extractSink('speech')),
        state: componentSinks$.pipe(extractSink('state')),
        router: observableMerge(
            redirect$,
            componentSinks$.pipe(extractSink('router'))
        )
    };
}
