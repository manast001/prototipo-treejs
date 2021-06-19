import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { EngineService } from '../services/engine.service';

@Component({
  selector: 'app-visor-3d',
  templateUrl: './visor-3d.component.html',
  styleUrls: ['./visor-3d.component.css']
})
export class Visor3dComponent implements OnInit {
  @ViewChild('rendererCanvas', { static: true })
  public rendererCanvas: ElementRef<HTMLDivElement>;

  public constructor(private engServ: EngineService) {}

  public ngOnInit(): void {
    this.engServ.init(this.rendererCanvas);
    this.engServ.animate();
  }

  public stopRotation() {
    this.engServ.stopRotation();
  }

  public resize(event) {
    this.engServ.resize(event.target.innerWidth, event.target.innerHeight);
  }
}
