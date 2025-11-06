import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import Chart, { ChartDataset, ChartOptions, ChartEvent, ActiveElement } from 'chart.js/auto';

/**
 * Composant ChartComponent
 *
 * Affiche un graphique réutilisable (pie ou line) avec Chart.js
 * Gère la responsivité via `maintainAspectRatio: false`.
 *
 * Inputs :
 *  - type : 'pie' | 'line' → type de graphique
 *  - labels : string[] → labels du graphique
 *  - data : number[] → valeurs associées aux labels
 *
 * Output :
 *  - chartClick : émet l’index de l’élément cliqué
 */
@Component({
  selector: 'app-chart',
  template: `<div class="chart-container"><canvas #canvas></canvas></div>`,
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnChanges, OnDestroy, AfterViewInit {

  /** Référence vers le canvas HTML */
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  /** Type de graphique : 'pie' ou 'line' */
  @Input() type: 'pie' | 'line' = 'pie';

  /** Labels du graphique */
  @Input() labels: string[] = [];

  /** Données associées aux labels */
  @Input() data: number[] = [];

  /** Événement déclenché lors du clic sur un élément du graphique */
  @Output() chartClick = new EventEmitter<number>();

  /** Instance Chart.js */
  private chart?: Chart;

  // =========================
  // Lifecycle Hooks
  // =========================

  ngAfterViewInit(): void {
    this.buildChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.chart && (changes['data'] || changes['labels'] || changes['type'])) {
      this.chart.destroy();
      this.buildChart();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  // =========================
  // Chart Construction Methods
  // =========================

  /**
   * Crée le dataset Chart.js à partir des inputs
   */
  private createDataset(): ChartDataset {
    return {
      label: 'Données',
      data: this.data,
      backgroundColor: ['#0b868f', '#adc3de', '#7a3c53', '#8f6263', '#695E93', '#94819d'],
      borderColor: '#000',
      borderWidth: 1,
      fill: this.type !== 'line',
      tension: this.type === 'line' ? 0.3 : undefined
    };
  }

  /**
   * Génère les options Chart.js en fonction du type de graphique
   */
  private getChartOptions(): ChartOptions {
    return {
      responsive: true,
      maintainAspectRatio: false, // le chart s'adapte à son conteneur !
      plugins: { legend: { position: 'bottom', display: true } },
      onClick: (event: ChartEvent, elements: ActiveElement[]) => {
        if (elements.length) {
          const index = elements[0].index;
          if (index !== undefined) {
            this.chartClick.emit(index);
          }
        }
      },
      scales: this.type === 'line'
        ? {
            x: { title: { display: true, text: 'Année' } },
            y: { title: { display: true, text: 'Valeur' }, beginAtZero: true }
          }
        : undefined
    };
  }

  /**
   * Crée ou met à jour le chart
   */
  private buildChart(): void {
    if (!this.labels?.length || !this.data?.length || !this.canvas) return;

    const dataset = this.createDataset();
    const options = this.getChartOptions();

    this.chart = new Chart(this.canvas.nativeElement, {
      type: this.type,
      data: { labels: this.labels, datasets: [dataset] },
      options
    });
  }
}
