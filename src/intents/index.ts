'use strict';
import { BasicCard, Button, DialogflowConversation, Image } from 'actions-on-google';
import { Utils } from '../utils';

export class GoogleIntents {
  private utils: Utils = new Utils();
  constructor(actions: any) {
    actions.intent('Last Track', async (conv: DialogflowConversation) => {
      const track = await this.utils.getLastTrack();
      if (track) {
        conv.close(new BasicCard({
          buttons: new Button({
            title: track.query,
            url: track.externalURL
          }),
          image: new Image({
            alt: track.artist[0],
            url: track.image
          }),
          title: `The last song played was ${track.query}`
        }));
      }
    });
  }
}

export default GoogleIntents;
