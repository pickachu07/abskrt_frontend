import React from 'react'
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Button from '@material-ui/core/Button';
import { Paper } from '@material-ui/core';
import TransactionTable from './TransactionTable';
import HistoricalRenkoContainer from './HistoricalRenkoContainer';
import Switch from '@material-ui/core/Switch';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';
import FaceIcon from '@material-ui/icons/Face';


const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  switch:{
    marginLeft: theme.spacing.unit*2
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 3,
    height: '100vh',
    overflow: 'auto',
    width:'100%'
  },
  tableContainer: {
    width: '100%',
    height: '420px'
  },
  chartContainer: {
    marginTop:theme.spacing.unit *2,
    width: '100%',
    height: '420px'
  },
  textField: {
    marginLeft: theme.spacing.unit* 1,
    marginRight: theme.spacing.unit* 1,
  },
  fullWidth : {
    marginLeft : theme.spacing.unit*1, 
    marginRight : theme.spacing.unit*1, 
    width:'90%'
  },
  button: {
    marginLeft : theme.spacing.unit*3,
    width:'90%'
  },
  rightIcon: {
    marginLeft: theme.spacing.unit,
  },
  toolbarPaper:{
      paddingLeft: theme.spacing.unit,
      paddingRight: theme.spacing.unit,
  },
  actionContainer:{
    marginTop:theme.spacing.unit
  }
});

class HistoricalTab extends React.Component {
  constructor(){
      super()
      this.state = {brick_size:4,ticker_name:"BANKNIFTY",date:"2019-05-27",data:[],tickData:[],trans:[],profit:0,fetch_from_database:true};
      this.handleBSChange = this.handleBSChange.bind(this);
      this.handlePlay = this.handlePlay.bind(this);
      this.handleDateChange = this.handleDateChange.bind(this);
      this.handleTNChange = this.handleTNChange.bind(this);
      this.stompClient = null;
      this.getStompClient = this.getStompClient.bind(this);
      this.SocketConnect = this.SocketConnect.bind(this);
      this.switchDataSource = this.switchDataSource.bind(this);
      this.handleStop = this.handleStop.bind(this);
  }

  switchDataSource = () =>{
    if(this.state.fetch_from_database === false){
      this.setState({fetch_from_database : true});
    }else{
      this.setState({fetch_from_database : false});
    }
  }

  draw = (event) => {
    if(this.state.fetch_from_database === true){
      this.setState({data:[]});
      fetch('http://localhost:8080/historical/'+this.state.date+'/'+this.state.brick_size)
          .then(res => res.json())
          .then(ndata => {
            console.log("data from subscribe action: "+ndata.length);
            for(var i=0;i<ndata.length;i++){
              //console.log("****nDataBody:"+JSON.parse(ndata.body)[i].data);
              var nd =new Date(ndata[i].data.timestamp)
              var op = ndata[i].data.open;
              var hi = ndata[i].data.high;
              var lo = ndata[i].data.low;
              var cl = ndata[i].data.close;
              var vol = ndata[i].data.volume;
              var newBrick = {date: nd, open: op, high: hi, low: lo, close: cl, volume : vol};
              this.setState({data : [...this.state.data, newBrick]});
              //bricks.push(newBrick);
            }
          });
    }
    event.preventDefault();
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
      

      stompClientInstance.subscribe('/topic/historical_calculated_data_stream', cdata => {
        let cProfit = JSON.parse(cdata.body);
        this.setState({profit:cProfit})
        console.log("profit:"+cProfit);
      });


      stompClientInstance.subscribe('/topic/notification_stream', ndata => {
        let notification = JSON.parse(ndata.body);
        console.log("Notification Received: "+notification.message);
      });


      stompClientInstance.subscribe('/topic/historical_trans_stream', transactions => {
        let results = JSON.parse(transactions.body);
        let output = [];  
        for(let i = 0;i<results.length;i++){
          let seq = results[i].columnKey;
          let val = results[i];
          output[seq] =  val; 
        }
        this.setState({trans:output});
        console.log("trans:"+this.state.trans);
      });

      stompClientInstance.subscribe('/topic/historical_ohlc_stream', ndata => {
        var bricks = [];
        //this.setState({data : []});//reset data
        //for(var i=0;i<JSON.parse(ndata.body).length;i++){
         // console.log("****nDataBody:"+JSON.parse(ndata.body)[i].data);
          var nd =new Date(JSON.parse(ndata.body).data.timestamp)
          var op = JSON.parse(ndata.body).data.open;
          var hi = JSON.parse(ndata.body).data.high;
          var lo = JSON.parse(ndata.body).data.low;
          var cl = JSON.parse(ndata.body).data.close;
          var vol = JSON.parse(ndata.body).data.volume;
          var newBrick = {date: nd, open: op, high: hi, low: lo, close: cl, volume : vol};
          this.setState({tickData : [...this.state.tickData, newBrick]});
          //bricks.push(newBrick);
        //}
        //console.log("****stateData:"+this.state.data);
      });

      stompClientInstance.subscribe('/topic/historical_data_stream', ndata => {
        var bricks = [];
        //this.setState({data : []});//reset data
        for(var i=0;i<JSON.parse(ndata.body).length;i++){
          console.log("****nDataBody:"+JSON.parse(ndata.body)[i].data);
          var nd =new Date(JSON.parse(ndata.body)[i].data.timestamp)
          var op = JSON.parse(ndata.body)[i].data.open;
          var hi = JSON.parse(ndata.body)[i].data.high;
          var lo = JSON.parse(ndata.body)[i].data.low;
          var cl = JSON.parse(ndata.body)[i].data.close;
          var vol = JSON.parse(ndata.body)[i].data.volume;
          var newBrick = {date: nd, open: op, high: hi, low: lo, close: cl, volume : vol};
          this.setState({data : [...this.state.data, newBrick]});
          //bricks.push(newBrick);
        }
        //console.log("****stateData:"+this.state.data);
      });
});
}

  handleStop(event){
    this.getStompClient().send("/app/StopHistoricalDataStream",{},{});
    this.setState({streamingStarted: false});
    console.log('Historical Tab: Streaming stopped!');
    event.preventDefault();
  }

  handlePlay(event) {
    this.setState({data : []});//reset data
    this.getStompClient().send("/app/StartHistoricalDataStream", {}, JSON.stringify({'brick_size' : this.state.brick_size,'ticker_name': this.state.ticker_name,'date':this.state.date}))
    this.setState({streamingStarted: true});
    console.log('Historical Tab: A ticker was submitted: ' + this.state.ticker +": BS: "+this.state.brick_size);
    event.preventDefault();
  }

  handleBSChange = (event) => {
    console.log("Brick Size changed");
    this.setState({brick_size: event.target.value});
  }

  handleTNChange = (event) => {
    console.log("Ticker name changed");
    this.setState({ticker_name: event.target.value});
  }

  handleDateChange = (event) =>{
    if(event.target.id == "historical-date"){
        console.log("Historical date changed"+this.state.date);
        this.setState({date: event.target.value});
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <Typography variant="h6" gutterBottom component="h6">
            Historical Data | Profit: {this.state.profit}
      </Typography>
      <div className={classes.root}>
      <Paper elevation={1} className={classes.toolbarPaper}>
        <Grid container direction="row" justify="space-between" alignItems="center" spacing={0}>
            <Grid item xs={2}>
            <TextField
              required
              id="historical-ticker-name"
              label="Ticker"
              margin="normal"
              placeholder="NIFTY_BANK"
              className={classes.fullWidth}
              value={this.state.ticker_name || ""}
              onChange={this.handleTNChange}
              margin="normal"
              variant="outlined"
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
            <TextField
              id="historical-date"
              label="Start"
              type="date"
              placeholder="2019-01-05"
              className={classes.fullWidth}
              defaultValue={this.state.date}
              onChange={this.handleDateChange}
              margin="normal"
              variant="outlined"
              InputLabelProps={{
              shrink: true,
              }}
            />
            </Grid>
            <Grid item xs={1}>
              <Button variant="contained" color="default" className={classes.button} onClick={this.draw}>
                Draw
              </Button>
            </Grid>
            <Grid item xs={1}>
              <Button variant="contained" color="primary" className={classes.button} onClick={this.handlePlay}>
                Play
              </Button>
            </Grid>
            <Grid item xs={1}>
              <Button variant="contained" color="default" className={classes.button} onClick={this.handleExchangeDisconnect}>
                pause
              </Button>
            </Grid>
            <Grid item xs={1}>
              <Button variant="contained" color="secondary" className={classes.button} onClick={this.handleStop}>
                Stop
              </Button>
            </Grid>
            <Grid item xs={1}>
            <FormControlLabel className={classes.switch}
              control={
            <Switch
              checked={this.state.fetch_from_database}
              onChange={this.switchDataSource}
              value="true"
              color="primary"
            />}
            label="DB"
            />
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
        </Paper>
        <Grid container direction="row" justify="space-between" alignItems="center" spacing={0}>
          <Paper className={classes.chartContainer}>
            <HistoricalRenkoContainer data={this.state.data}/>
          </Paper>
        </Grid>
        <Grid container direction="row" justify="space-between" alignItems="center" spacing={0}>
          <Paper className={classes.chartContainer}>
            <HistoricalRenkoContainer data={this.state.tickData}/>
          </Paper>
        </Grid>
        {this.state.data.length>2 && 
          <div className={classes.actionContainer}>
          <Typography variant="h6" gutterBottom component="h6">
            Actions
          </Typography>
          <div className={classes.tableContainer}>
            <TransactionTable data={this.state.trans}/>
          </div>
          </div>}
      </div> 
      </main>
    )
  }
}
export default withStyles(styles)(HistoricalTab)