/**
 * The following functions are adapted from:
 * https://github.com/jvanbruegge/cyclejs-test-helpers
 */
import {
    of as observableOf,
    merge as observableMerge,
    never as observableNever
} from 'rxjs';
import { mockTimeSource, MockTimeSource } from '@cycle/time/rxjs';

export function withTime(
    test: (Time: MockTimeSource) => void
): () => Promise<boolean> {
    return () => {
        const Time = mockTimeSource();

        test(Time);

        return new Promise((resolve, reject) => {
            Time.run(err => {
                if (err) {
                    return reject(err);
                }

                return resolve();
            });
        });
    };
}

export function addPrevState(
    main: any,
    prevState: any,
    stateName: string = 'state'
): any {
    return function(sources: any): any {
        const initReducer = observableOf(() => prevState);
        const appSinks = main(sources);
        return {
            ...appSinks,
            [stateName]: observableMerge(
                initReducer,
                appSinks[stateName] || observableNever()
            )
        };
    };
}
