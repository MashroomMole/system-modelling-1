export interface Event {
    value: number;
    type: EventTypes;
}

export interface Record {
    t: number;
    event: string;
    l1:  Event; 
    l2: Event;
    h: Event;
    queue: Array<Event>;
    serverBusy: boolean; 
}


export enum EventTypes {
    L1 = 'L1',
    L2 = 'L2',
    server = 'server'

}

export enum Distributions {
    Poisson,
    Erlang, 
    Normal

}