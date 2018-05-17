import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { User, UserService } from "../api/user.service";
import {
  GithubApiService,
  githubEventsApiRes,
  githubIssuesApiRes
} from "../api/github-api.service";
import { TrelloService } from "../api/trello.service";

@Component({
  selector: 'app-one-board',
  templateUrl: './one-board.component.html',
  styleUrls: ['./one-board.component.css']
})
export class OneBoardComponent implements OnInit {
  currentUserId: string;
  myUser;
  
  boardId: string;
  board;
  members;
  lists;
  backlogList;
  doingList;
  donelist;
  backlogCards;
  doingCards;
  doneCards;
  
  eventsJSON: Array<githubEventsApiRes> = [];
  issuesJSON: Array<githubIssuesApiRes> = [];
  
  username: string;

  autocomplete: { data: { [key: string]: string } };
  users: User[] = [];



  constructor(
    private reqThing: ActivatedRoute,
    public gitAPI: GithubApiService,
    private resThing: Router,
    private userThing: UserService,
    private trelloThing: TrelloService
  ) {}

  ngOnInit() {
    // Get the URL parameters for this route
    this.reqThing.paramMap.subscribe( myParams => {
      this.boardId = myParams.get( "boardId" );
      this.getMyUser();
      this.fetchBoardData();
    });

    this.getRepoEventsFeed();
    this.getRepoIssuesFeed();
    console.log( "BOARDS", this.board );
  }

  getMyUser() {
    this.trelloThing.getMyUser()
      .then(( myUser ) => {
        this.myUser = myUser;
        console.log( "MY ID", this.myUser.id );
      })
      .catch(( error ) => {
        console.log( error );
      })
  }

  fetchBoardData() {
    this.trelloThing.getBoard( this.boardId )
      .then(( board ) => {
        this.board = board;
        console.log( "BOARD CONSOLE LOG", this.board );
        return this.trelloThing.getMembers( this.boardId )
      })
      .then(( members ) => {
        this.members = members;
        console.log( "MEMBERS HERE" );
        console.log( this.members );
        return this.trelloThing.getLists( this.boardId )
      })
      .then(( lists ) => {
        this.lists = lists;
        console.log( "LISTS" );
        console.log( this.lists );

        this.backlogList = this.lists.filter( l => l.name === "BACKLOG" )
        this.doingList = this.lists.filter( l => l.name === "DOING" )
        this.donelist = this.lists.filter( l => l.name === "DONE" )
        console.log( "DOING LIST" );
        console.log( this.backlogList );
        console.log( this.doingList );
        console.log( this.donelist );
        return this.trelloThing.getCards( this.doingList[0].id );
      })
      .then(( cards ) => {
        this.doingCards = cards;
        console.log( "DOING CARDS" );
        console.log( this.doingCards );
        console.log( "TYPE OF CARD MEMBER ID", typeof this.doingCards[0].idMembers[0] );
        console.log( "TYPE OF CURRENT USER ID", typeof this.currentUserId );
        return this.trelloThing.getCards( this.backlogList[0].id );
      })
      .then(( cards ) => {
        this.backlogCards = cards;
        return this.trelloThing.getCards( this.donelist[0].id );
      })
      .then(( cards ) => {
        this.doneCards = cards;
      })
      .catch(( error ) => {
        console.log( "fetchBoardData ERROR" );
        console.log( error );
      });
  }

  moveToDoing( cardId, doingListId ) {
    this.trelloThing.moveToDoing( cardId, doingListId, this.myUser.id )
      .then(() => {
        console.log( "Card moved to doing!" );
      })
      .catch(( err ) => {
        console.log( "moveToDoing ERROR" );
        console.log( err );
      })
  }

  moveToDone( cardId, donelistId ) {
    this.trelloThing.moveToDone( cardId, donelistId )
      .then(() => {
        console.log( "Card moved to done!" );
      })
      .catch(( err ) => {
        console.log( "moveToDone ERROR" );
        console.log( err );
      });
  }

  getRepoEventsFeed() {
    this.gitAPI
      .githubEventsFeed("LPsola", "Project03-frontend")
      // this.gitAPI.githubEventsFeed("jaredhanson","passport")
      .then((result: any) => {
        this.eventsJSON = this.gitAPI.filterGithubEventsFeed(result);
      })
      .catch(err => {
        console.log(`Error getting github feed: ${err}`);
      });
  }

  getRepoIssuesFeed() {
    this.gitAPI
      .githubIssuesFeed("jaredhanson", "passport")
      .then((result: any) => {
        this.issuesJSON = this.gitAPI.filterGithubIssuesFeed(result);

        // console.log(`githubIssuesFeed results: this.apiInfo`,result)
      })
      .catch(err => {
        console.log(`Error getting github feed: ${err}`);
      });
  }

  fetchUserData() {
    // Get the info of the connected user
    this.userThing.check()
      .then( result => {
        console.log( "USER" );
        console.log( result );
        this.currentUserId = result.userInfo._id;
        console.log( "USER ID" );
        console.log( this.currentUserId );
      })
      .catch(( err ) => {
        console.log( "fetchUserData ERROR" );
        console.log( err );
      })
  }

  setAutocomplete(userList) {
    this.autocomplete = {
      data: userList
    };
  }

  goToBot( boardId ) {
    this.trelloThing.getBoard( boardId )
      .then(( board ) => {
        this.resThing.navigateByUrl(`/board/${ boardId }/bot`);
      })
      .catch(err => {
        console.log("goToProject ERROR");
        console.log(err);
      });
  }
}
