import { Component, OnInit } from '@angular/core';
import { JiraRestService } from '../../services/jira-rest.service';
import { Issue } from '../../stubs/jira';
import { MatSnackBar, MatDialogRef, MatDialog } from '@angular/material';
import { Storage } from '../../utils/storage';
import { HttpResponse } from '@angular/common/http/src/response';

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
    this.showLoader = true;
    this.showMessage = false;
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
                        this.showLoader = false;
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
    if(this.activeIssueKey!=null && logTimeSeconds > 60){ //Ensuring a minimum of 1 minute is logged against the task
        this.jService.addWorkLog(this.activeIssueKey,logTimeSeconds)
                      .subscribe((resp:HttpResponse<any>)=>{
                          if(resp.ok)
                            this.notifyUI("Task Hours updated.");
                          else
                            this.notifyUI("Encountered error while updating Task Hours.");
                      });
    }
  }

  //UI Triggers
  suspendTool(event:any):void{
    if(event.checked){
      this.logCurrentActiveTask();
      this.init();
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
    this.init();
  }

  closeTask(issueKey:string):void{
    this.jService.closeIssue(issueKey)
                    .subscribe((resp:HttpResponse<any>)=>{
                      if(resp.ok){
                        this.init();
                        this.notifyUI("Task marked as Done.");
                      }
                      else{
                        this.notifyUI("Error encountered while closing the Task.");
                      }
                    });
    
  }

  showQuerySettings():void{
    let querySettingsDialog = this.settingsDialog.open(LogWorkSettingsDialog,{width:"600px"});
    querySettingsDialog.afterClosed().subscribe(()=>{
      this.init();
    });
  }

  notifyUI(msg:string):void{
    this.snackBar.open(msg,null,{duration:5000});
  }
}

@Component({
  selector:"log-work-settings-dialog",
  templateUrl:"log-work-settings-dialog.html",
  styleUrls: ['./logger.component.css']
})
export class LogWorkSettingsDialog implements OnInit{
  
  stdFilterString:string = " and status in ('In Progress') and issuetype in ('Sub-task') order by key";
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
