import {ConfigKeys} from "./config-keys.enum";
import { Injectable } from "@angular/core";
import * as crypto from 'crypto-js';

@Injectable()
export class Storage{
    
    //Random key for cryption
    key:string = "hku5sdf62";
    //Default JQL Filter strings
    stdFilterString:string = " and status in ('In Progress') and issuetype in ('Sub-task') order by key";
  
    get(key:string):string{
        return localStorage.getItem(key);
    }

    set(key:string,value:string):void{
        localStorage.setItem(key,value);
    }

    getJiraHost():string{
        return this.get(ConfigKeys.jiraHost);
    }

    getUserName():string{
        return this.get(ConfigKeys.userName);
    }

    getPassphrase():string{
        return (crypto.AES.decrypt(this.get(ConfigKeys.passPhrase),this.key)).toString(crypto.enc.Utf8);
    }

    getJiraQuery():string{
        return this.get(ConfigKeys.jiraQuery);
    }

    isJiraQueryCustom():boolean{
        let flag:string = this.get(ConfigKeys.isJiraQueryCustom);
        if(flag != null && flag == "1")
            return true;
        return false;
    }

    isConnectionSuccessful():boolean{
        let flag:string = this.get(ConfigKeys.isConnectionSuccessful);
        if(flag != null && flag == "1")
            return true;
        return false;
    }

    setJiraHost(host:string):void{
        if(host.endsWith("/")){
            host = host.slice(0,host.length-1);
        }
        this.set(ConfigKeys.jiraHost,host);
    }

    setUserName(username:string):void{
        this.set(ConfigKeys.userName,username);
        this.setJiraQuery(`assignee = ${this.getUserName()}`);
    }

    setPassphrase(passPhrase:string):void{
        let hash = crypto.AES.encrypt(passPhrase,this.key);
        this.set(ConfigKeys.passPhrase,hash);
    }

    setJiraQuery(query:string):void{
        this.set(ConfigKeys.jiraQuery,query+this.stdFilterString);
    }

    setJiraQueryCustomFlag(flag:boolean):void{
        let tmp = "0";
        if(flag){tmp = "1";}
        else{
            this.setJiraQuery(`assignee = ${this.getUserName()}`);
        }
        this.set(ConfigKeys.isJiraQueryCustom,tmp);
    }

    setConnectionSuccessful(flag:boolean):void{
        let tmp = "0";
        if(flag){tmp = "1";}
        this.set(ConfigKeys.isConnectionSuccessful,tmp);            
    }

}