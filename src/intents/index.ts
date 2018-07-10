'use strict';
import { BasicCard, Button, DialogflowConversation, Image, List, SimpleResponse } from 'actions-on-google';
import * as moment from 'moment';
import { EndpointService } from '../routes/endpoint/endpoint.service';
import { ITrack } from '../schemas';
import { Utils } from '../utils';

export class GoogleIntents {
  private utils: Utils = new Utils();
  private service: EndpointService = new EndpointService();
  constructor(actions: any) {
    this.lastTrack(actions);
    this.totalDuration(actions);
  }

  private lastTrack(actions: any) {
    actions.intent('Last Track', async (conv: DialogflowConversation) => {
      const track: ITrack | null = await this.utils.getLastTrack();
      if (track) {
        conv.close(new SimpleResponse({
          speech: `The last song played was ${track.query} ${moment(track.created).fromNow()}`
        }));
        conv.close(new BasicCard({
          buttons: new Button({
            title: track.query,
            url: track.externalURL
          }),
          image: new Image({
            alt: track.artist[0],
            url: track.image
          }),
          subtitle: moment(track.created).fromNow(),
          title: track.query
        }));
      }
    });
  }

  private totalDuration(actions: any) {
    actions.intent('Total Duration', async (conv: DialogflowConversation) => {
      const duration = await this.service.totalDuration('thismonth', '', '');
      conv.close(new SimpleResponse({
        speech: `Total music listened to this month is ${duration.formatted}`,
        text: `Total music listened to this month is ${duration.formatted}`
      }));
    });
  }
}

export default GoogleIntents;
