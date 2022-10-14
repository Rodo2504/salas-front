import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { SalasComponent } from './components/salas/salas.component';

const routes: Routes = [
  {path: 'Inicio', component: HomeComponent},
  {path: 'Salas', component: SalasComponent},
  {path: '**', component: HomeComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
