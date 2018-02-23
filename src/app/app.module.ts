import { BrowserModule } from "@angular/platform-browser";
import { ErrorHandler, NgModule } from "@angular/core";
import { IonicApp, IonicErrorHandler, IonicModule } from "ionic-angular";
import { MyApp } from "./app.component";
import { HomePage } from "../pages/home/home";

// PLUGINS
import { SplashScreen } from "@ionic-native/splash-screen";
import { StatusBar } from "@ionic-native/status-bar";
import { DeviceOrientation } from "@ionic-native/device-orientation";
import { Geolocation } from "@ionic-native/geolocation";
import { Geofence } from "@ionic-native/geofence";
import { CameraPreview } from '@ionic-native/camera-preview';
import { File } from '@ionic-native/file';
import { SocialSharing } from '@ionic-native/social-sharing';

@NgModule({
  declarations: [MyApp, HomePage],
  imports: [BrowserModule, IonicModule.forRoot(MyApp)],
  bootstrap: [IonicApp],
  entryComponents: [MyApp, HomePage],
  providers: [
    StatusBar,
    SplashScreen,
    DeviceOrientation,
    Geolocation,
    Geofence,
    CameraPreview,
    File,
    SocialSharing,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule {}
// ANDROID : AIzaSyCfY35r6mY7xFZauiPV0YevNT-k1VG2Cvo
// iOS : AIzaSyCZzewMLbwkSxsoOzD0Oe1V23THJYpg-b4
