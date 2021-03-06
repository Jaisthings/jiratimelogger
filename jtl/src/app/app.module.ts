import { BrowserModule } from '@angular/platform-browser';
import { NgModule, enableProdMode } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import { AppComponent } from './app.component';
import { LoggerComponent, LogWorkSettingsDialog } from './components/logger/logger.component';
import { SettingsComponent } from './components/settings/settings.component';
import { RouterModule } from '@angular/router';
import { Routes } from '@angular/router/src/config';
import { JiraRestService } from './services/jira-rest.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatCardModule, MatButtonModule, MatSlideToggleModule, MatDividerModule, MatSidenavModule, MatListModule, MatIconModule, MatGridListModule, MatProgressBarModule, MatProgressSpinnerModule, MatDialogModule, MatInputModule, MatSnackBarModule, MatRadioModule } from '@angular/material';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RoundPipe } from './pipes/round.pipe';
import { Storage } from './utils/storage';
import { ErrorInterceptor } from './interceptors/error-interceptor';

const appRoutes:Routes = [
  {path:'settings',component:SettingsComponent},
  {path:'log-work',component:LoggerComponent}
];
enableProdMode();


@NgModule({
  declarations: [
    AppComponent,
    LoggerComponent,
    SettingsComponent,
    RoundPipe,
    LogWorkSettingsDialog
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(appRoutes),
    MatCardModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatGridListModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    HttpClientModule,
    MatDialogModule,
    MatInputModule,
    MatSnackBarModule,
    MatRadioModule,
    FormsModule
  ],
  providers: [
    JiraRestService,
    Storage,
    [
      {
      provide:HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi:true
      }
    ]
  ],
  
  bootstrap: [AppComponent],
  schemas:[NO_ERRORS_SCHEMA],
  entryComponents:[
    LogWorkSettingsDialog
  ]
})
export class AppModule { }
