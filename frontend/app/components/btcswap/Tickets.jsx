// var _ = require('lodash');
var React = require("react");
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
// var FormattedMessage = ReactIntl.FormattedMessage;
var TransitionGroup = require('../TransitionGroup');

var Table = require("react-bootstrap/lib/Table");

var Nav = require("./Nav");
var TicketRow = require("./TicketRow");
var TicketDetails = require("./TicketDetails");
var Button = require('react-bootstrap/lib/Button');
var Modal = require('react-bootstrap/lib/Modal');
var ConfirmModal = require('../ConfirmModal');
var AlertModal = require('../AlertModal');
// var utils = require('../js/utils');

var Tickets = React.createClass({
  contextTypes: {
    router: React.PropTypes.func
  },

  mixins: [IntlMixin],

  getInitialState() {
    return {
      alertLevel: 'info',
      alertMessage: '',
      showAlert: false,
      showModal: false,
      showConfirmModal: false,
      message: null,
      submit: null
    };
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.ticket.error)
      this.setState({
        showAlert: true,
        alertLevel: 'danger',
        alertMessage: nextProps.ticket.error
      });
  },

  openConfirmModal: function(ticket) {
    this.setState({
      showConfirmModal: true,
      message: ticket.owner == this.props.user.user.id ?
        "Are you sure you want to cancel this ticket?" :
        <div>
          { (!ticket.claimer || (ticket.expiry > 1 && ticket.expiry < new Date().getTime() / 1000)) ?
              "Reserve ticket #" + ticket.id + "?" : "Claim ticket #" + ticket.id + "?" }
          <TicketDetails ticket={ticket} />
        </div>,
      submit: function() { this.handleAction(ticket); }.bind(this)
    });
  },

  closeConfirmModal: function() {
    this.setState({ showConfirmModal: false });
  },

  openModal: function(ticket) {
    this.setState({
      showModal: true,
      message: <TicketDetails ticket={ticket} />
    });
  },

  closeModal: function() {
    this.setState({ showModal: false });
  },

  setAlert: function(alertLevel, alertMessage) {
    this.setState({
      alertLevel: alertLevel,
      alertMessage: alertMessage
    });
  },

  showAlert: function() {
    this.setState({ showAlert: true });
  },

  hideAlert: function() {
    this.props.flux.actions.ticket.closeAlert();
    this.setState({ showAlert: false});
  },

  handleAction(ticket) {
      if (ticket.owner == this.props.user.user.id)
        this.props.flux.actions.ticket.cancelTicket(ticket.id);
      else if (!ticket.claimer) {
        this.props.flux.actions.ticket.lookupTicket(ticket.id);
        this.context.router.transitionTo('reserve');
      }
      else {
        this.props.flux.actions.ticket.lookupTicket(ticket.id);
        this.context.router.transitionTo('claim');
      }
  },

  render() {
    var ticketRows = this.props.ticket.tickets.map(function (ticket, i) {
      var key = "ticket-" + ticket.id;
      return (
        <TicketRow
          flux={this.props.flux} key={key} count={i} ticket={ticket}
          isOwn={ticket.owner === this.props.user.user.id} user={this.props.user.user}
          openModal={this.openModal} openConfirmModal={this.openConfirmModal} />
      );
    }.bind(this));

    return (
      <div>
        <Nav />
        {
        // <h3>Tickets offering Ether for Bitcoin</h3>
        }
        <Table condensed hover responsive striped>
          <thead>
            <tr>
              <th className="text-right">ID</th>
              <th className="text-right">AMOUNT</th>
              <th className="text-right">PRICE BTC/ETH</th>
              <th className="text-right">TOTAL</th>
              <th className="text-center">BTC ADDRESS</th>
              <th className="text-center">EXPIRY</th>
              <th className="text-center trade-op"></th>
            </tr>
          </thead>
          <TransitionGroup transitionName="trades" component="tbody" enterTimeout={1000} leaveTimeout={1000}>
            {ticketRows}
          </TransitionGroup>
        </Table>

        <AlertModal
          show={this.state.showAlert}
          onHide={this.hideAlert}
          alertTitle="Oh snap!"
          message={this.state.alertMessage}
          level={this.state.alertLevel}
        />

        <ConfirmModal
          show={this.state.showConfirmModal}
          onHide={this.closeConfirmModal}
          message={this.state.message}
          onSubmit={this.state.submit}
        />

        <Modal show={this.state.showModal} onHide={this.closeModal} animation={true} enforceFocus={false}>
          <Modal.Header closeButton>
            <Modal.Title>Ticket details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <big><p>{this.state.message}</p></big>
          </Modal.Body>
          <Modal.Footer>
              <Button onClick={this.closeModal} bsStyle="primary">Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
});

module.exports = Tickets;
