import React from 'react';
import ChartComponent from "./ChartComponent";
import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';
import FaceIcon from '@material-ui/icons/Face';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
const styles = theme =>({
  root: {
    flexGrow: 1,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 3,
    height: '100vh',
    overflow: 'auto',
    width:'100%'
  },
  textField: {
    marginLeft: theme.spacing.unit* 2,
    marginRight: theme.spacing.unit* 2,
  },
  fullWidth : {
    marginLeft : theme.spacing.unit*3, 
    marginRight : theme.spacing.unit*3, 
    width:'90%'
  },
  button: {
    marginLeft : theme.spacing.unit*3,
    width:'90%'
  },
});

class RealtimeRenkoContainer extends React.Component {
  
  constructor(){
    super();
    this.state = {ticker: 'NIFTY_BANK', brick_size : 4, streamingStarted : false,connected:false,data:[]};

    this.handleTChange = this.handleTChange.bind(this);
    this.handleBSChange = this.handleBSChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleStop = this.handleStop.bind(this);
    this.stompClient = null;
    this.getStompClient = this.getStompClient.bind(this);
    this.SocketConnect = this.SocketConnect.bind(this);
    this.handleExchangeDisconnect = this.handleExchangeDisconnect.bind(this);
  }

  handleTChange(event) {
    this.setState({ticker: event.target.value});
  }

  handleBSChange(event) {
    this.setState({brick_size: event.target.value});
  }

  handleSubmit(event) {
    //this.getStompClient().send("/app/start_streaming", {}, JSON.stringify({'brick_size' : this.state.brick_size,'ticker_name': this.state.ticker}))
    //this.setState({streamingStarted: true});
    fetch('http://localhost:8080/subscribe/'+this.state.ticker+'/'+this.state.brick_size)
          .then(results => {
            return results.json();
          }).then(data => {
            console.log("data from subscribe action: "+data);
          });
    
    console.log('A ticker was submitted: ' + this.state.ticker +": BS: "+this.state.brick_size);
    event.preventDefault();
  }
  handleStop(event){
    //this.getStompClient().send("/app/stop_streaming", {}, {});
    //this.setState({streamingStarted: false});
    fetch('http://localhost:8080/unsubscribe?ticker='+this.state.ticker_name)
          .then(results => {
            return results.json();
          }).then(data => {
            console.log("data from unsub action: "+data);
          });
  
    console.log('Stop Streaming pressed');
    event.preventDefault();
  }

  handleExchangeDisconnect = () =>{
    fetch('http://localhost:8080/disconnect')
          .then(results => {
            return results.json();
          }).then(data => {
            console.log("data from disconnect action: "+data);
          });
  
    console.log('Disconnect from Exchange pressed');
  }

  getStompClient = () =>{
    if(this.stompClient== null){
      let socket = new SockJS("http://localhost:8080/gs-guide-websocket");
      this.stompClient= Stomp.over(socket);
    }
    return this.stompClient;
  }

  SocketConnect = () =>{
    if(this.state.connected === true)return;
    let stompClientInstance = this.getStompClient();

    stompClientInstance.connect({}, frame => {
      this.setState({connected: true});
      
      fetch('http://localhost:8080/connect')
      .then(results => {
        return results.json();
      }).then(data => {
        console.log("data from connect action: "+data);
});


      stompClientInstance.subscribe('/topic/ticker_stream', ndata => {
        //this.setState({data : []});//reset data
        if(this.state.data!=null){
          var nd =new Date(JSON.parse(ndata.body).data.timestamp)
          var op = JSON.parse(ndata.body).data.open;
          var hi = JSON.parse(ndata.body).data.high;
          var lo = JSON.parse(ndata.body).data.low;
          var cl = JSON.parse(ndata.body).data.close;
          var vol = JSON.parse(ndata.body).data.volume;
          var newArr = {date: nd, open: op, high: hi, low: lo, close: cl, volume : vol};
          this.setState({data : [...this.state.data, newArr]});
          //console.log("****stateData:"+this.state.data);
        }
    
      });
    });
    stompClientInstance.ws.onclose = () =>{
      this.setState({connected: false});
    }

    fetch('http://localhost:8080/unsubscribe?ticker='+this.state.ticker_name)
          .then(results => {
            return results.json();
          }).then(data => {
            console.log("data from connect action: "+data);
    });
}

  render() {
    const {classes} = this.props;
      return(
        <div className={classes.root}>
          <Grid container direction="row" justify="space-between" alignItems="center" spacing={4}>
            <Grid item xs={3}>
            <TextField
              id="ticker-input"
              label="Ticker"
              value={this.state.ticker || ""}
              className={classes.fullWidth}
              placeholder="NIFTY_BANK"
              disabled={this.state.streamingStarted}
              margin="normal"
              
              variant="outlined"
              onChange={this.handleTChange}
              InputLabelProps={{
              shrink: true,
              }}
            />
            </Grid>
            <Grid item xs={1}>
              <TextField
                id="bs-input"
                label="Brick Size"
                value={this.state.brick_size || ""}
                className={classes.fullWidth}
                placeholder="4"
                disabled={this.state.streamingStarted}
                margin="normal"
                
                variant="outlined"
                onChange={this.handleBSChange}
                InputLabelProps={{
                shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={2}>
              <Button variant="contained" color="default" className={classes.button} onClick={this.handleSubmit}>
                Subscribe
              </Button>
            </Grid>
            <Grid item xs={2}>
              <Button variant="contained" color="primary" className={classes.button} onClick={this.handleStop}>
                Unsubscribe
              </Button>
            </Grid>
            <Grid item xs={3}>
              <Button variant="contained" color="secondary" className={classes.button} onClick={this.handleExchangeDisconnect}>
                Disconnect Exchange
              </Button>
            </Grid>

            <Grid item xs={1}>
              <Chip 
                  onClick={this.SocketConnect}
                  className={classes.connectedChip} 
                  label={this.state.connected ? "Connected" : "Connect"} 
                  color={this.state.connected ? "primary" : "default"}
                  avatar={<Avatar><FaceIcon /></Avatar>}//TODO: change avatar based on state
              />
            </Grid>
          </Grid>
          <Grid container spacing={3}>
            <ChartComponent chartData={this.state.data}/>
          </Grid>
        </div>
        
        );
    }
  }


  export default withStyles(styles)(RealtimeRenkoContainer)