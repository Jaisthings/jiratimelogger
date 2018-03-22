import { Component, OnInit } from '@angular/core';
import { JiraRestService } from '../../services/jira-rest.service';
import { Issue, JiraResponseWrapper } from '../../stubs/jira';
import { MatSnackBar, MatDialogRef, MatDialog } from '@angular/material';
import { Storage } from '../../utils/storage';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http/src/response';

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
    }
  }

  getTasks():void{
    if(this.goodToConnect()){
      this.showLoader = true;
      this.jService.getTasks()
                    .subscribe((resp:HttpResponse<any>)=> {
                        this.showLoader = false;
                        if(resp.ok){
                          let wrapper = <JiraResponseWrapper> resp.body;
                          this.issues = wrapper.issues;
                          
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
                        }else{
                          this.showMessage = true;
                          this.message = "Encountered Error while fetching Tasks. "+resp.statusText;
                        }
                    },
                  (error:HttpErrorResponse) => {
                    this.showErrorResponse(error);
                  });
      }
  }
  
  goodToConnect():boolean{
    let flag = this.storage.isConnectionSuccessful();
    if(!flag){
      this.showMessage = true;
      this.message = this.badConnectionDetailsMsg;
    }else{
      this.showMessage = false;
    }
    return flag;
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
                      },
                      (error:HttpErrorResponse)=>{
                        this.showErrorResponse(error);
                      });
    }
  }

  //UI Triggers
  suspendTool(event:any):void{
    if(event.checked){
      if(this.goodToConnect()){
        this.logCurrentActiveTask();
        this.init();
      }
    }else{
      this.issueStartTime = performance.now();
    }
  }

  activateTask(event:any):void{
    if(this.goodToConnect()){
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
  }

  closeTask(issueKey:string):void{
    if(this.goodToConnect()){
      this.jService.closeIssue(issueKey)
      .subscribe((resp:HttpResponse<any>)=>{
        if(resp.ok){
          this.init();
          this.notifyUI("Task marked as Done.");
        }
        else{
          this.notifyUI("Error encountered while closing the Task.");
        }
      },
      (error:HttpErrorResponse) => {
        this.showErrorResponse(error);
      });
    }
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

  showErrorResponse(err:HttpErrorResponse):void{
    this.showLoader = false;
    this.showMessage = true;
    this.message = err.status+" - "+err.message;
  }
}

@Component({
  selector:"log-work-settings-dialog",
  templateUrl:"log-work-settings-dialog.html",
  styleUrls: ['./logger.component.css']
})
export class LogWorkSettingsDialog implements OnInit{
  
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
    if(this.customQueryFlag){
      this.storage.setJiraQuery(this.jiraQuery);
    }
    this.storage.setJiraQueryCustomFlag(this.customQueryFlag);
    this.dialogRef.close();
    this.snackBar.open("Settings Saved.",null,{duration:5000});
  }
}
