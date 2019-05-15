import React from 'react'
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { FormHelperText } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';

const styles = theme => ({
  appBarSpacer: theme.mixins.toolbar,
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 3,
    height: '100vh',
    overflow: 'auto',
    width:'100%'
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
  },
  fullWidth : {
    marginLeft : theme.spacing.unit*2, 
  },
  button: {
    margin: theme.spacing.unit,
    width:'100%'
  },
});

class SettingsTab extends React.Component {
  
  constructor(){
    super()
    this.state = {accessToken:"",clientId:"",clientSecret:"",isTokenvalid:false};
    this.getAuthData = this.getAuthData.bind(this);
    this.initAuthentication = this.initAuthentication.bind(this);
      
        
  }
  initAuthentication = () => {
    window.open("http://localhost:8080/initauth", "_blank");
  }
  componentDidMount() {
    this.getAuthData();
  }
  
  getAuthData = () => {
    fetch('http://localhost:8080/get-auth-data')
          .then(results => {
            return results.json();
          }).then(data => {
            this.setState({clientId : data.client_id});
            this.setState({clientSecret : data.client_secret});
            this.setState({accessToken : data.access_token});
            this.setState({isTokenvalid : data.is_token_valid});
          });
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        <div className={classes.appBarSpacer} />
        <main className={classes.content}>
        <Typography variant="h4" gutterBottom component="h4">
            Settings
          </Typography>
           <TextField
          id="client-id"
          label="Client id"
          value={this.state.clientId}
          className={classes.fullWidth}
          placeholder="Placeholder"
          disabled
          fullWidth
          margin="normal"
          variant="outlined"
          InputLabelProps={{
            shrink: true,
          }}
          />
        <TextField
          id="client-secret"
          label="Client Secret"
          value={this.state.clientSecret}
          className={classes.fullWidth}
          value={this.state.clientSecret}
          disabled
          fullWidth
          margin="normal"
          variant="outlined"
          InputLabelProps={{
            shrink: true,
          }}
        />
          <TextField
          id="access-token"
          label="Access-token"
          disabled
          value={this.state.accessToken}
          className={classes.fullWidth}
          placeholder="Token"
          helperText={this.state.isTokenvalid ? "valid" : "expired"}
          fullWidth
          margin="normal"
          variant="outlined"
          InputLabelProps={{
            shrink: true,
          }}
        />
        <div className={classes.root}>
          <Grid container spacing={24}>
            {/* <Grid item xs>
                <Button variant="contained" className={classes.button} >
                  Save
                </Button>
            </Grid> */}
            <Grid item xs>  
              <Button variant="contained" color="primary" className={classes.button} onClick={this.initAuthentication}>
                Generate Token
              </Button>
            </Grid>
          </Grid>
        </div>
        </main>
      </div>
    )
  }
}
export default withStyles(styles)(SettingsTab)