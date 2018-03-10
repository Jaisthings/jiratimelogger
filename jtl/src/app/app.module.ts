import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { LoggerComponent } from './components/logger/logger.component';
import { SettingsComponent } from './components/settings/settings.component';
import { RouterModule } from '@angular/router/src/router_module';
import { Routes } from '@angular/router/src/config';
import { JiraRestService } from './services/jira-rest.service';
import { NO_ERRORS_SCHEMA } from '@angular/core/src/metadata/ng_module';
import { MatCardModule, MatButtonModule, MatSlideToggleModule, MatDividerModule, MatSidenavModule, MatListModule, MatIconModule, MatGridListModule, MatProgressBarModule, MatProgressSpinnerModule, MatDialogModule, MatInputModule, MatSnackBarModule, MatRadioModule } from '@angular/material';
import { HttpClientModule } from '@angular/common/http/src/module';
import { FormsModule } from '@angular/forms';

const appRoutes:Routes = [
  {path:'settings',component:SettingsComponent},
  {path:'log-work',component:LoggerComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    LoggerComponent,
    SettingsComponent,
    
  ],
  imports: [
    BrowserModule,
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
    JiraRestService
  ],
  bootstrap: [AppComponent],
  schemas:[NO_ERRORS_SCHEMA],
  entryComponents:[]
})
export class AppModule { }
