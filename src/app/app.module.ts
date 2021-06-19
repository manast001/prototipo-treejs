import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { Visor3dComponent } from './visor-3d/visor-3d.component';
import { EngineService } from './services/engine.service';

@NgModule({
  imports: [BrowserModule, FormsModule],
  declarations: [AppComponent, Visor3dComponent],
  bootstrap: [AppComponent],
  providers: [EngineService]
})
export class AppModule {}
