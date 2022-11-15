import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { SummaryComponent } from './summary/summary.component';
import { LoginComponent } from './login/login.component'
import { ReactiveFormsModule } from '@angular/forms';
import { NgxCaptchaModule } from 'ngx-captcha';
import { ClipboardModule } from 'ngx-clipboard';
import { NgxCopyPasteModule } from 'ngx-copypaste';

@NgModule({
  declarations: [
    AppComponent,
    SummaryComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgxCaptchaModule,
    NgxCopyPasteModule,
    ClipboardModule,
    
    
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
