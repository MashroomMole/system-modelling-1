import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Record, Distributions, EventTypes } from './models';
import { ChartConfiguration, } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { makeNormalDistribution, makeParameters, generateNumber, removeFromQueue, pushToQueue, generateResponse } from './utils/utils.shared';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  @ViewChildren( BaseChartDirective )
  charts?: QueryList<BaseChartDirective>;

  lineChartType: any = "line";
  chartOptions: any = {
    responsive: true
  };

  dist: Distributions = 0;
  numbers: Array<number> = [];
  records: Array<Record> = [];
  queue: Array<number> = [];
  serverFreeTime: number = 0;
  serverUsageRatio: number = 0;
  queueMembers: Array<string> = [];
  lineChartData: ChartConfiguration['data'] =  {
    datasets:  [
      {
        data: this.numbers,
        label: '',
      }
    ],
    labels: ['Series A']
  };

  lineChartDataSet: ChartConfiguration['data'] =  {
    datasets:  [
      {
        data: this.queue,
        label: 'Queue',
      },
    ],
    labels: ['Queue length / step']
  };

   ngOnInit(): void {
         

  }

  start() {
    let T = 0;
    let record: Array<Record>;

    this.serverFreeTime = 0;

    record = [
      {
        t: T, 
        event: 'start',
        l1: {
          value: generateNumber(Distributions.Poisson), type: EventTypes.L1
        }, 
        l2: {
        value: generateNumber(Distributions.Erlang), type: EventTypes.L2
        }, 
        h: {value: 501, type: EventTypes.server},
        queue: [],
        serverBusy: false
      }
  ];

  let i = 1;
    while (T < 500) {
      let nextProcessedRequest;
      let currentMoment;
      const c = 501;

      nextProcessedRequest = record[i-1].queue.length > 0 ? record[i-1].queue[0] : [record[i-1].l1, record[i-1].l2].reduce((prev, curr) => {return prev.value < curr.value ? prev : curr}) ;
      currentMoment = [record[i-1].l1, record[i-1].l2, record[i-1].h].reduce((prev, curr) => prev.value < curr.value ? prev : curr);

      this.serverFreeTime = !record[i-1].serverBusy ? this.serverFreeTime + (currentMoment.value - record[i-1].t) : this.serverFreeTime;

      T = currentMoment.value;

      switch (record[i-1].event) {
        case 'start':
          record[i] = {
            t: T,
            event: currentMoment.type,
            l1: {
              value: T === record[i-1].l1.value ?
                T + generateNumber(Distributions.Poisson) : 
                record[i-1].l1.value, type:  EventTypes.L1
                },
            l2: {
              value: T === record[i-1].l2.value ?
                T + generateNumber(Distributions.Erlang) : 
                record[i-1].l2.value, type: EventTypes.L2
                }, 
            h:  {
              value: record[i-1].h.value - c + T + generateResponse(nextProcessedRequest),
                 type: EventTypes.server 
                },
            serverBusy: true,
            queue: []
            };

            let q = record[i].queue;
            let qArr = [...q.map(a => a.value)]
  
            let length = qArr.length;

            this.queue.push(length);
            this.lineChartDataSet.labels?.push(i);
            break;
              
        default:
          record[i] = {
            t: currentMoment.value,
            event: currentMoment.type,
            l1: {value: currentMoment.type !== EventTypes.server && currentMoment.type === EventTypes.L1 ? 
              record[i-1].l1.value + generateNumber(Distributions.Poisson) : 
              record[i-1].l1.value, 
              type: EventTypes.L1
            }, 
            l2: {value: currentMoment.type !== EventTypes.server && currentMoment.type === EventTypes.L2 ? 
              record[i-1].l2.value + generateNumber(Distributions.Erlang) : 
              record[i-1].l2.value, 
              type: EventTypes.L2
            }, 
            h: {value: currentMoment.type !== EventTypes.server ? 
              record[i-1].h.value : 
              currentMoment.value + generateResponse(nextProcessedRequest),
              type: EventTypes.server
            },
            serverBusy: currentMoment.type === EventTypes.server ? false : true,
            queue: currentMoment.type === EventTypes.server ? removeFromQueue(record[i-1].queue) : record[i-1].serverBusy ? pushToQueue(record[i-1].queue, currentMoment) : [...record[i-1].queue]
          };
            
          let qd = record[i].queue;
          let qdArr = [...qd.map(a => a.value)]
          let lengthd = qdArr.length;
          this.queue.push(lengthd);
          this.lineChartDataSet.labels?.push(i);
   
          break;
        }
        
        i++;
      }
  
    this.charts!.get(0)!.update();
    this.queueMembers = record.map(a => a.queue.map(a => a.type)).flat();
    this.serverUsageRatio = 1 - this.serverFreeTime/T;
    console.log(record);

    return this.records;
  }

  testRand() {
    switch (this.dist) {
      case Distributions.Poisson: {
        for (let i = 0; i < 100; i ++) {
          this.numbers.push ( makeParameters(1, 0.25) );
          this.lineChartData.labels?.push(this.lineChartData.datasets[0].data.length + '');
        }
        console.log(this.numbers, 'Generated numbers');
        this.lineChartData.datasets[0].label = 'Poisson/Exponential'
        this.charts!.get(1)!.update();
        break;
      }
  
      case Distributions.Erlang: {
        for(let i =0; i < 100; i++) {
          this.numbers.push( makeParameters(3, 0.5) );
          this.lineChartData.labels?.push(this.lineChartData.datasets[0].data.length + '');

        }
        console.log(this.numbers, 'Generated numbers');
        this.lineChartData.datasets[0].label = 'Erlang'
        this.charts!.get(1)!.update();
        break;
      }
  
      case Distributions.Normal: {
        for(let i =0; i < 100; i++) {
          this.numbers.push ( makeNormalDistribution(1, 10) );
          this.lineChartData.labels?.push(this.lineChartData.datasets[0].data.length + '');
        }
        console.log(this.numbers);
        this.lineChartData.datasets[0].label = 'Normal',
        this.charts!.get(1)!.update();
        break;
      }
       
      default:
        return;
    }
  }
}
