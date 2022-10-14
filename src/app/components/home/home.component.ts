import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { interval } from 'rxjs';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { SalasService } from '../../services/salas.service';
import { ReservasService } from '../../services/reservas.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  constructor(public salaService: SalasService, public reservaService: ReservasService, public toastr: ToastrService) { }
  public secs   = interval(7000); //5000
  public secs2  = interval(1000);
  salas: any                                // aqui se guardan todas las salas obtenidas del servicio
  err_1: boolean = false                    // error, la hora final es menor que la inicial
  err_2: boolean = false                    // error, marca que son mas de dos horas
  err_3: boolean = false                    // error, la hora inicial es menor que la actual
  sala: any                                 // guardara id de la sala donde se quiere hacer reserva, mas adelante se validara si hay espacios libres
  reservas_sala: any                        // guardara todas las reservas de cierta sala
  todas_reservas: any                       // guardara todas las reservas, de todas las salas
  
  form = new FormGroup({                              //formulario para escoger sala
    hr_in: new FormControl('', Validators.required),
    hr_fin: new FormControl('', Validators.required),
    nombre: new FormControl('', Validators.required)
  });

  ngOnInit(): void {
    this.getSalas();
    this.secs.subscribe(()=>{
      this.getSalas();  // eliminar?
      this.reservaService.getReservas().subscribe((data)=>{                           //se obtienen todas las reservas
        this.todas_reservas = data;        
        var hr_actual = moment(moment().format('HH:mm'), 'HH:mm');
        for(let i of this.todas_reservas){
          if(hr_actual.isSame(moment(i.Hra_ini,'HH:mm')) && i.Estado == 'pendiente'){  //entra si la hora actual es la misma que la reserva y si el estado de la reserva es pendiente
            this.reservaService.updateReservaStatus(i.Id).subscribe(data=>{ });        //se toma la sala y se cambia el estado de la reserva
            this.salaService.updateSalaStatus('ocupada',i.Sala).subscribe(data=>{      //cambia el estado de la sala a ocupada
              this.getSalas()                                                          //obtiene las salas actualizadas 
            });  
            this.toastr.info(`${i.Nombre_sala} tomada por ${i.Encargado}`)  
          }
          if(hr_actual.isSame(moment(i.Hra_fin,'HH:mm'))){                              //entra si la hora actual es igual la hora final de una reserva
            this.salaService.updateSalaStatus('libre',i.Sala).subscribe(data=>{         //cambia el estado de la sala a libre
              this.getSalas();                                                          //obtiene las salas actualizadas
            });
            this.reservaService.deleteReserva(i.Id).subscribe(data=>{
              this.reservaService.getReservasSala(i.Sala).subscribe(data=>{             //obtiene las reservas de la sala actual
                this.reservas_sala = data;
              })
            });
            this.toastr.info(`Sesión terminada, ${i.Encargado} ha dejado la ${i.Nombre_sala}`)            
          }
        } 
      });  
       //this.cambio()      
    });
  }
  getSalas(){
    this.salaService.getSalas().subscribe(data=>{
      this.salas = data;
    });
  }
  reservar(id: string){                                                  //funcion que despliega el boton de 'reservar'
    this.form.get('hr_in')?.setValue('');                                //limpiando el form
    this.form.get('hr_fin')?.setValue('');
    this.form.get('nombre')?.setValue('');
    this.sala = id;                                                      //guarda el id de la sala
    this.reservaService.getReservasSala(id).subscribe(data=>{
      this.reservas_sala = data;                                         //obtiene las reservas de esa sala
    });
  } 
  onSubmit(){
    var hr_1 = moment(this.form.value.hr_in, 'HH:mm');        //valores del input a objetos time           
    var hr_2 = moment(this.form.value.hr_fin, 'HH:mm');
    var estado = true;                                        //estado para saber si se podar insertar nuevo horario
    for(let i of this.reservas_sala){                         //se recorrera cada reservacion para validar horarios
      var hr1_aux = moment(i.Hra_ini, 'HH:mm');               //convertir los tiempos de las reservaciones a objetos time
      var hr2_aux = moment(i.Hra_fin, 'HH:mm');
      if((hr_1.isBefore(hr1_aux) &&  hr_2.isBefore(hr1_aux)) || (hr_1.isAfter(hr2_aux) && hr_2.isAfter(hr2_aux))){
        estado = true;
      }else{
        estado = false;
        break;                                                //con una reserva que coincida de horario, termina el ciclo y cancela la reserva nueva
      }   
    }
    if(estado || this.reservas_sala[0]==null){                              //no hay reservas, se puede registrar
      this.reservaService.setReserva(this.sala, this.form.value.nombre!, this.form.value.hr_in!, this.form.value.hr_fin!).subscribe(data=>{
        this.toastr.success("Reserva hecha") 
        this.form.get('hr_in')?.setValue('');                                //limpiando el form
        this.form.get('hr_fin')?.setValue('');
        this.form.get('nombre')?.setValue('');
        this.reservaService.getReservasSala(this.sala).subscribe(data=>{    //obtener de nuevo las reservas de esa sala
          this.reservas_sala = data;
        });
      }); 
    }else{
      this.toastr.warning("Hay una reserva en ese horario")
    }
  }
  cancelar(reserva: any){                //funcion para cancelar una reservacion de cierta sala, se solicita la funcion desde el modal que muestra todas las reservaciones
    var hr_actual = moment(moment().format('HH:mm'), 'HH:mm');
    if( hr_actual.isSameOrAfter(moment(reserva.Hra_ini,'HH:mm')) && hr_actual.isSameOrBefore(moment(reserva.Hra_fin,"HH:mm"))){     //validar que sea la reserva actual
      this.toastr.error('Sesión actual, puede liberar la sala desde la página principal')
    }else{
      var res = confirm("¿Cancelar el uso de la sala?");
      if(res){
        this.reservaService.deleteReserva(reserva.Id).subscribe((data)=>{
          this.toastr.success('Reserva eliminada')
          this.reservaService.getReservasSala(this.sala).subscribe(data=>{                //obtener de nuevo las reservas de esa sala
            this.reservas_sala = data;
          });
        })
      }
    }    
  }
  liberar(s: any){
    var hr_actual = moment(moment().format('HH:mm'), 'HH:mm');
    var res = confirm(`¿Desea liberar la ${s.Nombre} de la reunión actual?`);
    var id_aux: any;
    if(res){
      this.reservaService.getReservasSala(s.Id).subscribe(data=>{
        this.reservas_sala = data;
        for(let i of this.reservas_sala){
          if(hr_actual.isSameOrAfter(moment(i.Hra_ini,'HH:mm')) && hr_actual.isSameOrBefore(moment(i.Hra_fin,"HH:mm"))){          //encontramos la reservacion actual
            id_aux = i.Id;            //se guarda el id de la reservacion
            break;
          }
        }
        this.reservaService.deleteReserva(id_aux).subscribe(data=>{ });               // quitar la reservacion
        this.salaService.updateSalaStatus('libre',s.Id).subscribe(data=>{                // cambia el estado de la sala a libre
          this.getSalas();                                                      // obtiene las salas actualizadas
        });
        this.toastr.info(`${s.Nombre} liberada`)  
      });
    }
    console.log(s);
  }
  cambio(){                                                           //funcion que se ejecuta cuando hay un cambio en los input de time en el formulario para reservar
    this.secs2.subscribe(()=>{
      var hr_actual = moment(moment().format('HH:mm'), 'HH:mm');
      var hr_1 = moment(this.form.value.hr_in, 'HH:mm');                
      var hr_2 = moment(this.form.value.hr_fin, 'HH:mm');       
      var diferencia_1 = hr_1.diff(hr_actual, 'minutes');               //se obtiene la diferencia, ya que la hora inicial tiene que ser mayor que la hora actual.
      if(diferencia_1 < 0){                                             //la hora inicial es menor que la actual y no debe ser.
        this.err_3 = true;
      }else{ this.err_3 = false }   
      var diferencia_2 = hr_2.diff(hr_1, 'minutes');
      if(diferencia_2 <= 0){                                             // la hora final es mayor que la inicial, lo cual es un error.
        this.err_1 = true;
      }else{ this.err_1 = false }
      if(diferencia_2 > 120){                                           // si son mas de dos hrs (120 mins) tambien estaria mal.
        this.err_2 = true;
      }else{ this.err_2 = false }
    })    
  }
}
