import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ReservasService {
  constructor(private http: HttpClient) { }

  url = 'https://api-salas.herokuapp.com';

  getReservas(){
    return this.http.get(`${this.url}/reservas`);
  }
  setReserva(sala:string, encargado:string, hr_1:string, hr_2:string){     //registrar reserva
    //const body = new HttpParams().set('Sala',sala).set('Encargado',encargado).set('Hra_ini',hr_1).set('Hra_fin',hr_2).set('Estado','pendiente');
    const body = {'Sala': sala, 'Encargado': encargado, 'Hra_ini': hr_1, 'Hra_fin': hr_2, 'Estado': 'pendiente'};
    return this.http.post(`${this.url}/reserva`, body);
  }
  getReservasSala(sala:string){     //obtener reservas de la sala
    return this.http.get(`${this.url}/reservas/${sala}`);
  }
  deleteReserva(id:string){
    return this.http.delete(`${this.url}/reserva/${id}`);
  }
  updateReservaStatus(id:string){
    //const body = new HttpParams().set('Estado','ejecucion');
    const body = {'Estado': 'ejecucion'};
    return this.http.put(`${this.url}/reserva/${id}`, body);
  }
}
