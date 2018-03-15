import { Component, OnInit } from '@angular/core';
import { JiraRestService } from '../../services/jira-rest.service';
import { Issue } from '../../stubs/jira';
import { MatSnackBar, MatDialogRef, MatDialog } from '@angular/material';
import { Storage } from '../../utils/storage';

@Component({
  selector: 'app-logger',
  templateUrl: './logger.component.html',
  styleUrls: ['./logger.component.css']
})
export class LoggerComponent implements OnInit {

  issues:Issue[];
  issuesMap:Map<string,Issue> = new Map();
  showMessage:boolean = false;
  message:string;
  showLoader:boolean = false;
  activeIssueKey:string;
  issueStartTime:number;
  suspendOn:boolean = false;

  badConnectionDetailsMsg:string = "There seems to be a problem connecting to the Jira server. Please check the details in the Settings section.";

  constructor(private jService:JiraRestService,private snackBar:MatSnackBar,
                  private settingsDialog:MatDialog,
                      private storage:Storage) { }

  ngOnInit() {
    this.init();  
  }

  init():void{
    if(this.goodToConnect()){
      this.showMessage = false;
      this.getTasks();
    }else{
      this.showMessage = true;
      this.message = this.badConnectionDetailsMsg;
    }
  }

  getTasks():void{
    this.showLoader = !this.showLoader;
    this.jService.getTasks()
                    .subscribe(wrapper => {
                        this.issues = wrapper.issues;
                        console.log(this.issues);
                        if(this.issues.length > 0){
                          this.issuesMap.clear();
                          this.issues.forEach((issue)=>{
                            issue.active = false;
                            this.issuesMap.set(issue.key,issue);
                          });
                          this.highlightActiveTask();
                        }else{
                          this.showMessage = true;
                          this.message = "No Tasks matched the Query criteria.";
                        }
                        this.showLoader = !this.showLoader;
                    });
  }
  
  goodToConnect():boolean{
    return this.storage.isConnectionSuccessful();
  }

  highlightActiveTask():void{
    this.issues.forEach((task)=>{
      task.active = false;
    })
    //activate appropriate task
    if(this.activeIssueKey != null)
      this.issuesMap.get(this.activeIssueKey).active = true;
  }

  logCurrentActiveTask():void{
    let logTimeSeconds = (performance.now() - this.issueStartTime)/1000;
    this.jService.addWorkLog(this.activeIssueKey,logTimeSeconds);
  }

  //UI Triggers
  suspendTool(event:any):void{
    if(event.checked){
      this.logCurrentActiveTask();
    }else{
      this.issueStartTime = performance.now();
    }
  }

  activateTask(event:any):void{
    this.logCurrentActiveTask();
    if(event.checked){
      //update activeIssueKey and issueStartTime
      this.activeIssueKey = event.source.id;
      this.issueStartTime = performance.now();
    }else{
      this.activeIssueKey = null;
    }
  }

  closeTask(issueKey:string):void{
    this.jService.closeIssue(issueKey);
    this.init();
  }

  showQuerySettings():void{
    let querySettingsDialog = this.settingsDialog.open(LogWorkSettingsDialog,{width:"600px"});
    querySettingsDialog.afterClosed().subscribe(()=>{
      this.init();
    });
  }
}

@Component({
  selector:"log-work-settings-dialog",
  templateUrl:"log-work-settings-dialog.html"
})
export class LogWorkSettingsDialog implements OnInit{
  
  stdFilterString:string = " and status in ('In Progress') and issuetype in ('Sub-task')";
  defaultQueryString:string = `assignee = ${this.storage.getUserName()} `+this.stdFilterString;
  customQueryFlag:boolean = false;
  jiraQuery:string="";

  constructor(private dialogRef:MatDialogRef<LogWorkSettingsDialog>,
                  private snackBar:MatSnackBar,
                    private storage:Storage){}

  ngOnInit(){
    this.loadSettings();
  }

  loadSettings():void{
    this.customQueryFlag = this.storage.isJiraQueryCustom();
    let query = this.storage.getJiraQuery();
    console.log("init query - "+query);
    if(query != null){
      this.jiraQuery = query;
    }
  }

  queryCategoryChanged(event:any):void{
    let value = event.value;
    if(value == "0"){
      this.customQueryFlag = false;
    }else{
      this.customQueryFlag = true;
    }
  }

  cancel():void{
    this.dialogRef.close();
  }

  saveQuerySettings():void{
    let query;
    if(this.customQueryFlag){
      query = this.jiraQuery+this.stdFilterString;
    }else{
      query = this.defaultQueryString;
    }
    console.log(query);
    this.storage.setJiraQueryCustomFlag(this.customQueryFlag);
    this.storage.setJiraQuery(query);
    this.dialogRef.close();
    this.snackBar.open("Settings Saved.",null,{duration:5000});
  }
}
