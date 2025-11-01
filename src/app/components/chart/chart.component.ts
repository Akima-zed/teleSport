import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-chart',
  template: `<div class="chart-container"><canvas #canvas></canvas></div>`,
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnChanges, OnDestroy, AfterViewInit {

  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  @Input() type: 'pie' | 'line' = 'pie';
  @Input() labels: string[] = [];
  @Input() data: number[] = [];
  @Output() chartClick = new EventEmitter<number>();

  private chart?: Chart;

  ngAfterViewInit(): void {
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.chart && (changes['data'] || changes['labels'] || changes['type'])) {
      this.chart.destroy();
      this.renderChart();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private renderChart(): void {
    if (!this.labels?.length || !this.data?.length) return;
    if (!this.canvas) return;

    const dataset = {
      label: 'Données',
      data: this.data,
      backgroundColor: ['#0b868f', '#adc3de', '#7a3c53', '#8f6263', 'orange', '#94819d'],
      borderColor: '#000',
      borderWidth: 1,
      fill: this.type === 'line' ? false : true,
      tension: this.type === 'line' ? 0.3 : undefined
    };

    this.chart = new Chart(this.canvas.nativeElement, {
      type: this.type,
      data: { labels: this.labels, datasets: [dataset] },
      options: {
        responsive: true,
        maintainAspectRatio: false, // laisse le chart s'adapter à son conteneur
        plugins: { legend: { position: 'bottom', display: true } },
        onClick: (event, elements) => {
          if (elements.length) {
            const index = (elements[0] as any).index;
            this.chartClick.emit(index);
          }
        },
        scales: this.type === 'line' ? {
          x: { title: { display: true, text: 'Année' } },
          y: { title: { display: true, text: 'Valeur' }, beginAtZero: true }
        } : undefined
      }
    });
  }
}
