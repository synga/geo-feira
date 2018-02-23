import { Component, ViewChild, ElementRef } from "@angular/core";
import {
  IonicPage,
  NavController,
  LoadingController,
  Platform,
  ToastController,
  ActionSheetController
} from "ionic-angular";
import {
  CameraPreview,
  CameraPreviewPictureOptions,
  CameraPreviewOptions
} from "@ionic-native/camera-preview";
import { File } from "@ionic-native/file";
import { SocialSharing } from "@ionic-native/social-sharing";

@IonicPage()
@Component({
  selector: "page-moldura",
  templateUrl: "moldura.html"
})
export class MolduraPage {
  /**
   * Canvas
   */
  @ViewChild("moldura") moldura: ElementRef;
  // --------------------------------------
  public heightSize: number = window.screen.height - 110;
  public widthSize: number = window.screen.width;
  public picture;
  public saveFilePath: string;
  private context: CanvasRenderingContext2D;
  private cameraPreviewOpts: CameraPreviewOptions = {
    x: 0, // posição x do preview
    y: 0, // posição y do preview
    width: this.widthSize, // width do preview
    height: this.heightSize, // height do preview
    camera: "front", // direção da camera
    tapPhoto: false, // tap na tela para tirar foto
    previewDrag: true,
    toBack: true,
    alpha: 1
  };

  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public actionSheet: ActionSheetController,
    private cameraPreview: CameraPreview,
    private file: File,
    private social: SocialSharing,
    private platform: Platform
  ) {}

  ionViewDidLoad = () => {
    // Pega o caminho para salvar a foto dependendo do OS
    this.saveFilePath = this.platform.is("android")
      ? "file:///storage/emulated/0/DCIM/Camera"
      : this.file.documentsDirectory;
    // Inicializa a camera com as opções declaradas no metodo cameraPreviewOpts
    this.cameraPreview
      .startCamera(this.cameraPreviewOpts)
      .then(res => console.log(res), err => console.log(err));
  };

  /**
   * Tira uma foto e gera um canvas dela
   */
  takePicture = () => {
    const loading = this.loadingCtrl.create({ content: "Aguarde..." });
    loading.present().then(() => {
      // picture options
      const pictureOpts: CameraPreviewPictureOptions = {
        width: this.widthSize,
        height: this.heightSize,
        quality: 100
      };

      // take a picture
      this.cameraPreview.takePicture(pictureOpts).then(
        imageData => {
          //fecha a camera
          this.cameraPreview.stopCamera();
          // salva a camera em uma variavel para mudar os controles na tela
          this.picture = "data:image/png;base64," + imageData[0];
          // CRIA O CANVAS
          let context: CanvasRenderingContext2D = this.moldura.nativeElement.getContext(
            "2d"
          );
          // Desenha primeiro a foto no canvas, depois desenha a moldura
          this.putPictureOnCanvas(context).then(res => {
            let overlay = new Image();
            overlay.onload = () => {
              context.drawImage(
                overlay,
                0,
                this.heightSize - this.heightSize / 5,
                this.widthSize,
                this.heightSize / 5
              );
              this.context = context;
              loading.dismiss();
            };
            overlay.src = "assets/imgs/wabiz.png";
          });
        },
        err => {
          console.log(err);
        }
      );
    });
  };

  /**
   * Muda a direção da camera
   */
  changeCameraDirection = () => this.cameraPreview.switchCamera();

  /**
   * Volta a página
   */
  goBack = () => this.navCtrl.pop();

  /**
   * Salva foto
   */
  savePhoto = () => {
    // CRIA LOADING
    const loading = this.loadingCtrl.create({ content: "Aguarde..." });
    // Cria toast de salvo com sucesso.
    const toastDone = this.toastCtrl.create({
      closeButtonText: "Ok",
      dismissOnPageChange: true,
      duration: 3000,
      message: "Foto salva na sua galeria.",
      position: "top",
      showCloseButton: true
    });
    // Cria toast de erro.
    const toastError = this.toastCtrl.create({
      closeButtonText: "Ok",
      dismissOnPageChange: true,
      duration: 3000,
      message: "Algo deu errado, tente novamente.",
      position: "top",
      showCloseButton: true
    });
    // inicializa o loading e salvar a foto
    loading.present().then(() => {
      let dataURI = this.moldura.nativeElement
        .toDataURL("image/png")
        .split(",")[1];
      let name = `wabiz_${Math.round(Math.random() * 10000)}.png`;
      this.base64ToBlob(dataURI, "image/png").then(blob => {
        this.file
          .writeFile(this.saveFilePath, name, blob)
          .then(success => {
            loading.dismiss();
            toastDone.present();
          })
          .catch(err => {
            console.log(err);
            loading.present();
            toastError.present();
          });
      });
    });
  };

  /**
   * Transforma o base64 em um blob para ser salvo
   * @param {string} data - String da base64 pura, sem contentType.
   * @param {string} contentType - Formato para ser salvo.
   */
  base64ToBlob = (data, contentType): Promise<Blob> => {
    contentType = contentType || "";
    let sliceSize = 512;

    let byteCharacters = atob(data);
    let byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      let slice = byteCharacters.slice(offset, offset + sliceSize);

      let byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      let byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    return new Promise<Blob>(resolve => {
      let blob: Blob = new Blob(byteArrays, { type: contentType });
      resolve(blob);
    });
  };

  /**
   * Compartilha foto
   */
  sharePhoto = () => {
    // Pega base64 da imagem no canvas
    let dataURI = this.moldura.nativeElement.toDataURL("image/png");
    // Abre o sheet para o usuário escolher onde quer compartilhar
    this.social
      .share("Wabiz #wabiz", "", dataURI)
      .then(res => console.log(res))
      .catch(err => console.log(err));
  };

  /**
   * Cancela a foto tirada e volta a tirar foto
   */
  cancelPhoto = () => {
    this.context.clearRect(0, 0, this.widthSize, this.heightSize);
    this.picture = null;
    this.cameraPreview.startCamera(this.cameraPreviewOpts);
  };

  /**
   * Desenha a foto no canvas
   */
  putPictureOnCanvas = (context: CanvasRenderingContext2D): Promise<any> => {
    let foto = new Image();
    foto.src = this.picture;

    return new Promise<any>(res => {
      foto.onload = () => {
        context.drawImage(foto, 0, 0, this.widthSize, this.heightSize);
        res(true);
      };
    });
  };

  /**
   * Para a camera ao sair da tela
   */
  ionViewWillUnload() {
    this.cameraPreview.stopCamera();
  }
}
