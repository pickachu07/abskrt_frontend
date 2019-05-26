import React from 'react'
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import Button from '@material-ui/core/Button';
import { Paper } from '@material-ui/core';
import TransactionTable from './TransactionTable';
import ChartComponent from './ChartComponent';
import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';
import FaceIcon from '@material-ui/icons/Face';


const styles = theme => ({
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
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 500,
  },
  brickSizeField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },
  dateField:{
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    marginTop: theme.spacing.unit*2,
    width: 200,
  },
  rightIcon: {
    marginLeft: theme.spacing.unit,
  },
  fetchButton:{
    marginleft: theme.spacing.unit*2,
    marginTop: theme.spacing.unit*2,
  },
  toolbarPaper:{
      padding: theme.spacing.unit*2,
      marginLeft: theme.spacing.unit*2,

  }
});

class DBViewerTab extends React.Component {
  constructor(){
      super()
      this.state = {brick_size:4,ticker_name:"BANKNIFTY",start_date:"2017-05-24",data:[],trans:[],profit:0};
      
      this.handleDateChange = this.handleDateChange.bind(this);
      this.handleTNChange = this.handleTNChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    this.setState({streamingStarted: true});
    console.log('Historical Tab: A ticker was submitted: ' + this.state.ticker +": BS: "+this.state.brick_size);
    event.preventDefault();
  }

  handleTNChange = (event) => {
    console.log("Ticker name changed");
    this.setState({ticker_name: event.target.value});
  }

  handleDateChange = (event) =>{
        console.log("date changed");
        this.setState({start_date: event.target.value});
  }

  

  render() {
    const { classes } = this.props;
    return (
      <div>
        <div className={classes.appBarSpacer} />
        <main className={classes.content}>
        <Typography variant="h6" gutterBottom component="h6">
            Saved Data | Profit: {this.state.profit}
          </Typography>
          <Grid container spacing={8}>
            <Grid item xs={12}>
                <Paper elevation={1} className={classes.toolbarPaper}>
                    <TextField
                        required
                        id="historical-ticker-name"
                        label="Ticker"
                        defaultValue={this.state.ticker_name}
                        onChange={this.handleTNChange}
                        className={classes.textField}
                        margin="normal"
                    />
                    <TextField
                        id="historical-start-date"
                        label="Start"
                        type="date"
                        defaultValue={this.state.start_date}
                        onChange={this.handleDateChange}
                        className={classes.dateField}
                        InputLabelProps={{
                        shrink: true,
                        }}
                    />
                    <Button variant="contained" color="default" className={classes.fetchButton} onClick={this.handleSubmit}>
                        Draw from DB
                        <CloudDownloadIcon className={classes.rightIcon} />
                    </Button>
                    <Chip 
                      onClick={this.SocketConnect}
                      className={classes.connectedChip} 
                      label={this.state.connected ? "Connected" : "Connect"} 
                      color={this.state.connected ? "primary" : "default"}
                      avatar={<Avatar><FaceIcon /></Avatar>}//TODO: change avatar based on state
                    />
                </Paper>
            </Grid>
            <Grid item xs={12}>
                <Paper className={classes.toolbarPaper}>
                  <ChartComponent chartData={this.state.data}/>
                </Paper>
            </Grid>
          </Grid>
          {this.state.data.length>2 && 
          <div>
          <Typography variant="h6" gutterBottom component="h6">
            Actions
          </Typography>
          <div className={classes.tableContainer}>
            <TransactionTable data={this.state.trans}/>
          </div>
          </div>}
        </main>
      </div>
    )
  }
}
export default withStyles(styles)(DBViewerTab)