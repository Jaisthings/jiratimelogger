import { Component, OnInit } from '@angular/core';
import { JiraRestService } from '../../services/jira-rest.service';
import { Issue } from '../../stubs/jira';
import { MatSnackBar } from '@angular/material';
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

  constructor(private jService:JiraRestService,private snackBar:MatSnackBar) { }

  ngOnInit() {
    if(this.goodToConnect()){
      this.showMessage = false;
      this.getTasks();
    }else{
      this.showMessage = true;
      this.message = this.badConnectionDetailsMsg;
    }
  }

  getTasks(){
    this.showLoader = !this.showLoader;
    this.jService.getTasks()
                    .subscribe(wrapper => {
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
                        this.showLoader = !this.showLoader;
                    });
  }
  
  goodToConnect():boolean{
    let flag:boolean = false;
    //TODO: implement logic
    return flag;
  }

  highlightActiveTask():void{
    this.issues.forEach((task)=>{
      task.active = false;
    })
    //activate appropriate task
    this.issuesMap.get(this.activeIssueKey).active = true;
  }

  //UI Triggers
  suspendTool(event:any):void{

  }

  activateTask(event:any):void{

  }

  closeTask(issueKey:string):void{

  }

  showQuerySettings():void{

  }


}
