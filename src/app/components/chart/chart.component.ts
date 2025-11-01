import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnChanges, OnDestroy {

  @Input() chartId = 'chart';
  @Input() type: 'pie' | 'line' = 'pie';
  @Input() labels: string[] = [];
  @Input() data: number[] = [];
  @Output() chartClick = new EventEmitter<number>();

  private chart?: Chart;

  // Options calculées dans le component, jamais dans le template
  private options = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['labels']) {
      this.prepareOptions();
      this.renderChart();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private prepareOptions(): void {
    this.options = {
      responsive: true,
      aspectRatio: window.innerWidth <= 767 ? 1 : 2.5,
      plugins: { legend: { position: 'bottom' } },
      onClick: (event: any, elements: any[]) => {
        if (elements.length) {
          const index = elements[0].index;
          this.chartClick.emit(index);
        }
      }
    };
  }

  private renderChart(): void {
    if (!this.labels.length || !this.data.length) return;

    setTimeout(() => {
      this.chart?.destroy();

      this.chart = new Chart(this.chartId, {
        type: this.type,
        data: {
          labels: this.labels,
          datasets: [{
            label: 'Données',
            data: this.data,
            backgroundColor: [
              '#0b868f', '#adc3de', '#7a3c53', '#8f6263', 'orange', '#94819d'
            ],
            borderColor: '#000',
            borderWidth: 1
          }]
        },
        options: this.options
      });
    });
  }
}
