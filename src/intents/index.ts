'use strict';
import { BasicCard, Button, DialogflowConversation, Image, List, SimpleResponse } from 'actions-on-google';
import * as _ from 'lodash';
import * as moment from 'moment';
import { EndpointService } from '../routes/endpoint/endpoint.service';
import { IArtist, ITrack } from '../schemas';
import { Utils } from '../utils';

export class GoogleIntents {
  private utils: Utils = new Utils();
  private service: EndpointService = new EndpointService();
  constructor(actions: any) {
    this.lastTrack(actions);
    this.totalDuration(actions);
    this.topArtists(actions);
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
    actions.intent('Total Duration', async (conv: DialogflowConversation, response: any) => {
      const duration = await this.service.totalDuration(_.replace(response.range, ' ', ''), '', '');
      conv.close(new SimpleResponse({
        speech: `Total music listened to ${response.range} is ${duration.formatted}`,
        text: `Total music listened to ${response.range} is ${duration.formatted}`
      }));
    });
  }

  private topArtists(actions: any) {
    actions.intent('Top Artists', async (conv: DialogflowConversation, response: any) => {
      const artists: IArtist[] = await this.service.topArtists(_.replace(response.range, ' ', ''), '', '');
      const items = _.zipObject(_.map(artists, 'name'), _.map(artists, (artist: IArtist) => ({
        description: `Total plays: ${artist.count}`,
        image: new Image({
          alt: artist.name,
          url: artist.image
        }),
        title: artist.name
      })));
      conv.close(new SimpleResponse({
        speech: `Your top artists ${response.range} is ${artists[0].name}`
      }));
      conv.close(new List({
        items,
        title: 'Top Artist'
      }));
    });
  }

}

export default GoogleIntents;
