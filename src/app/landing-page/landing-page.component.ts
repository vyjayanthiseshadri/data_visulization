// landing-page.component.ts

import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import * as d3 from 'd3';
@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
})

export class LandingPageComponent {
  showDialog = false;
  selectedChartType = 'bar';
  chartData: any; // Store D3 chart data here


  
generateChart(): void {
  const data = [10, 25, 15, 30, 20];

  // Clear any existing chart
  d3.select('#chart').selectAll('*').remove();

  switch (this.selectedChartType) {
    case 'bar':
      this.renderBarChart(data);
      break;
    default:
      console.error('Invalid chart type');
  }
}

  renderBarChart(data: number[]): void {
    const svgContainer = d3.select('#chart-container');
  
    // Remove existing SVG elements
    svgContainer.selectAll('*').remove();
  
    // Create a new SVG element
    const svg = svgContainer
      .append('svg')
      .attr('id', 'chart')
      .attr('width', 600)
      .attr('height', 400);
  
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = +svg.attr('width') - margin.left - margin.right;
    const height = +svg.attr('height') - margin.top - margin.bottom;
  
    const x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
    const y = d3.scaleLinear().rangeRound([height, 0]);
  
    const g = svg
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
  
    x.domain(data.map((d, i) => i.toString()));
    y.domain([0, d3.max(data, d => d as number)!]);
  
    g.append('g')
      .attr('class', 'axis axis-x')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x));
  
    g.append('g')
      .attr('class', 'axis axis-y')
      .call(d3.axisLeft(y).ticks(10, 's'))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '0.71em')
      .attr('text-anchor', 'end')
      .text('Value');
  
    g.selectAll('.bar')
      .data(data as number[])
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', (d, i) => x(i.toString())!)
      .attr('y', d => y(d))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d));
  }

  readExcelData(file: File): void {
    console.log('Reading Excel data from file:', file.name);
  
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const arrayBuffer = e.target.result;
      const data = this.parseExcelData(arrayBuffer);
      this.chartData = data;
      localStorage.setItem('excelData', JSON.stringify(this.chartData));
  
      // Generate chart after reading data
      this.generateChart();
    };
  
    reader.readAsArrayBuffer(file);
    console.log(file);
  }
  

  
  parseExcelData(arrayBuffer: ArrayBuffer): any[] {
    const binaryString = new Uint8Array(arrayBuffer).reduce((acc, byte) => acc + String.fromCharCode(byte), '');
    const workbook = XLSX.read(binaryString, { type: 'binary' });
  
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
  
    // Assuming your Excel file has a simple structure with headers in the first row
    const excelData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];
  
    // Assuming the first row contains headers, so skipping it in the result
    const headers: string[] = excelData.shift() as string[];
  
    // Map data to objects with headers as keys
    const formattedData = excelData.map((row) => {
      const rowData: any = {};
      headers.forEach((header, index) => {
        rowData[header] = (row[index] as string) || null; // Use null if the cell is empty
      });
      return rowData;
    });
  
    console.log('Parsed Excel data:', formattedData);
    console.log('Binary String:', binaryString);
    console.log('Workbook:', workbook);
    console.log('Sheet Name:', sheetName);
    console.log('Sheet:', sheet);
    console.log('Excel Data:', excelData);
    return formattedData;

  }
  


  
  
  
  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      console.log('File selected:', file.name);
      this.readExcelData(file);
      this.showDialog = true;
    }
  }
  
  

  closeDialog(): void {
    this.showDialog = false;
  }
}

