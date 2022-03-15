import { Distributions, Event, EventTypes } from "../models";

export function generateNumber(type: Distributions): number {
    switch (type) {
      case Distributions.Poisson:
      return makeParameters(1, 0.01);
 
     case Distributions.Erlang: {
         return makeParameters(3, 0.5);
     }
 
     case Distributions.Normal: {
       return makeNormalDistribution(1, 10);
     }
      
     default:
       return makeNormalDistribution(1, 10);
   }

 }

 export function makeParameters (l: number, lambda: number): number {
    let a = 0;

    for (let i = 0; i < l; i++) {
      const randomNumber = (-1/lambda) * Math.log(1 - Math.random());
      a = a + randomNumber;
    }

    return a
  }
  
  export function makeNormalDistribution(sigma: number, mu: number): number {
    let a = 0;
  
    for (let i = 0; i < 12; i++) {
      const randomNumber = Math.random();
      a = a + randomNumber;
    }
  
    return (a - 6) * sigma + mu;
  }
  
  export function removeFromQueue(queue: Array<Event>) : Array<Event> {
    return queue.slice(1);
  };

  export function generateResponse(request: Event): number {
    return  request.type === EventTypes.L1 ? 
     generateNumber(Distributions.Normal) :
     generateNumber(Distributions.Poisson)
}

  export function pushToQueue(queue: Array<Event>, request: Event) : Array< Event> {
    return [...queue, request]
  };
