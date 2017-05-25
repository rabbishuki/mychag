# myChag
#### Find the closest Chag event to your location.

## Usage
### Requirements
* [NodeJS](http://nodejs.org/) (with [NPM](https://www.npmjs.org/))

### Installation
1. Clone the repository: `git clone https://github.com/rabbishuki/mychag.git`.
2. Move into the new directory `cd mychag`.
3. Install the NodeJS dependencies: `npm install` *can take a minute*...
4. Configure the `process.env` object.
5. Run the server: `node server.js`.
6. Start sending API requests, as per [documentation](https://github.com/rabbishuki/mychag/blob/master/README.md#documentation).

### Releases
* 1.0 - 5/22/2017 (26 Iyar 5777)

## Documentation
### User routes

#### `GET: /api/1.0/ads/closestAd?location=31.776719,35.234508&formatted_address=הכותל+המערבי&range=5`
returns the 5 closest ads to location sent.
```js
message: "5 results found",
  location: {
    lat: "31.776719",
    lng: "35.234508"
  },
  ads: [{
      id: number,
      date: string,
      title: string,
      imgFile: string,
      comment: string,
      location: {
        lat: float,
        lng: float,
        formatted_address: string,
        distance: float
      },
      userInfo: {
        name: string,
        phone: string,
        email: string
      }
      out: {
        Link: string,
        LinkText: string
      }
    },...]
  }
```

#### `POST: /api/1.0/ads/newAd(ad)`
##### Currently: validates and returns the ad sent.
###### Proposed: validate and ad new ad to db.
