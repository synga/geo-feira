import { Component } from "@angular/core";
import {
  NavController,
  Platform,
  LoadingController,
  ModalController
} from "ionic-angular";
import {
  DeviceOrientation,
  DeviceOrientationCompassHeading
} from "@ionic-native/device-orientation";
import { Geolocation } from "@ionic-native/geolocation";
import { Geofence } from "@ionic-native/geofence";
import "rxjs/add/operator/filter";
import * as geodist from "geodist";

@Component({
  selector: "page-home",
  templateUrl: "home.html"
})
export class HomePage {
  /**
   * Alvo de onde quero chegar.
   */
  public target = { lat: -23.169096, lon: -46.910313 };
  /**
   * Minha posição para ser usada no calculo.
   */
  public myPos = { lat: 0, lon: 0 };
  /**
   * Precisão da geolocalização;
   */
  public accuracy: number = 0;
  /**
   * Distancia entre eu e o destino.
   */
  public dist: number = 0;
  /**
   * Objeto do geofence para quando o usuário cruzá-lo disparar uma notificação
   */
  public fence = {
    id: "69ca1b88-6fbe-4e80-a4d4-ff4d3748acdb", //any unique ID
    latitude: -23.169096,
    longitude: -46.910313,
    radius: 10,
    transitionType: 1,
    notification: {
      //notification settings
      id: 1,
      title: "Estamos chegando",
      text: "Você está bem perto, estamos no estande X.",
      openAppOnClick: true
    }
  };
  constructor(
    public navCtrl: NavController,
    private deviceOrientation: DeviceOrientation,
    private geolocation: Geolocation,
    public geofence: Geofence,
    public platform: Platform,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController
  ) {}

  ionViewWillLoad() {
    const loading = this.loadingCtrl.create({ content: "Aguarde..." });
    //loading.present().then(() => {
    // Garante que a plataforma esta pronta antes de inicializar o mapa.
    this.platform.ready().then(() => {
      this.geofence.addOrUpdate(this.fence);
      this.geolocation
        .getCurrentPosition({ enableHighAccuracy: true })
        .then(resp => {
          this.accuracy = Math.round(resp.coords.accuracy);
          this.myPos = {
            lat: resp.coords.latitude,
            lon: resp.coords.longitude
          };
          this.startCompass();
          this.getDistance();
          loading.dismiss();
        });
    });
    //});
  }

  /**
   * Bussola
   */
  startCompass = () => {
    let compass = document.getElementById("ponteiro");
    const subscription = this.geolocation
      .watchPosition({ enableHighAccuracy: true })
      .filter(p => p.coords !== undefined)
      .subscribe(resp => {
        this.accuracy = Math.round(resp.coords.accuracy);
        this.myPos = { lat: resp.coords.latitude, lon: resp.coords.longitude };
        this.getDistance();
      });
    /**
     * Watcher da orientação do device.
     * A cada 1000ms pega a orientação do aparelho e altera a posição do compasso.
     */
    const orientation = this.deviceOrientation
      .watchHeading({ frequency: 200 })
      .subscribe((data: DeviceOrientationCompassHeading) => {
        if (this.myPos) {
          // pega o angulo
          let angleDeg = this.getAngle();
          // muda o css da imagem para refletir o angulo
          compass.style.transform = `rotate(${(data.trueHeading - angleDeg) *
            -1}deg)`;
        }
      });
  };

  /**
   * Pega o angulo em graus da posição do usuário em relação a posição do ponto
   */
  getAngle = () => {
    return (
      Math.atan2(
        this.target.lon - this.myPos.lon,
        this.target.lat - this.myPos.lat
      ) *
      180 /
      Math.PI
    );
  };

  /**
   * Usa Haversine para calcular a distancia entre eu e o destino
   */
  getDistance = () => {
    this.dist = geodist(this.myPos, this.target, { unit: "meters" });
  };

  /**
   * Seta a posição do alvo/destino e onde o usuario quer chegar.
   */
  getPosition = () => {
    this.geolocation
      .getCurrentPosition({ enableHighAccuracy: true })
      .then(resp => {
        this.accuracy = Math.round(resp.coords.accuracy);
        // UPDATE DESTINO
        this.target = {
          lat: resp.coords.latitude,
          lon: resp.coords.longitude
        };
        // UPDATE GEOFENCE
        this.fence.latitude = resp.coords.latitude;
        this.fence.longitude = resp.coords.longitude;
        this.geofence.addOrUpdate(this.fence);
      });
  };

  /**
   * Visualiza o mapa em PDF da feira
   */
  showMap = () => this.navCtrl.push("MapaPage");

  /**
   * Vai para a página de tirar foto e salvar moldura
   */
  showFrame = () => this.navCtrl.push("MolduraPage");
}
