import { Component, OnInit } from '@angular/core';
import { Storage } from '../../utils/storage';
import { JiraRestService } from '../../services/jira-rest.service';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  username:string;
  passphrase:string;
  jiraHostServer:string;

  constructor(private storage:Storage,private jiraSvc:JiraRestService,
                  private snackBar:MatSnackBar) { }

  ngOnInit() {
    if(this.storage.getJiraHost() != null)
      this.jiraHostServer = this.storage.getJiraHost();
    
    if(this.storage.getUserName() != null)
      this.username = this.storage.getUserName();

    if(this.storage.getPassphrase() != null)
      this.passphrase = this.storage.getPassphrase();
  }


  saveConnectionDetails():void{
      this.storage.setJiraHost(this.jiraHostServer);
      this.storage.setUserName(this.username);
      this.storage.setPassphrase(this.passphrase);
      this.testConnection();
      this.snackBar.open("Settings saved.",null,{duration:5000});
  }

  resetConnectionDetails():void{
    this.jiraHostServer = this.storage.getJiraHost();
    this.username = this.storage.getUserName();
    this.passphrase = this.storage.getPassphrase();
  }

  testConnection():void{
    this.jiraSvc.testConnection();
  }

}
