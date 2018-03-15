import {ConfigKeys} from "./config-keys.enum";
import { Injectable } from "@angular/core";

@Injectable()
export class Storage{
    
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
        return this.get(ConfigKeys.passPhrase);
    }

    getJiraQuery():string{
        return this.get(ConfigKeys.jiraQuery);
    }

    isJiraQueryCustom():boolean{
        let flag:string = this.get(ConfigKeys.isJiraQueryCustom);
        if(flag != null && flag == "1")
            return true;
        else
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
    }

    setPassphrase(passPhrase:string):void{
        this.set(ConfigKeys.passPhrase,passPhrase);
    }

    setJiraQuery(query:string):void{
        this.set(ConfigKeys.jiraQuery,query);
    }

    setJiraQueryCustomFlag(flag:boolean):void{
        if(flag)
            this.set(ConfigKeys.isJiraQueryCustom,1+"");
        else
            this.set(ConfigKeys.isJiraQueryCustom,0+"");
    }

}