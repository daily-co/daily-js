import { dequal } from 'dequal';

const PermissionsMediaTypes = Object.freeze({
  VIDEO: 'video',
  AUDIO: 'audio',
  SCREEN_VIDEO: 'screenVideo',
  SCREEN_AUDIO: 'screenAudio',
  CUSTOM_VIDEO: 'customVideo',
  CUSTOM_AUDIO: 'customAudio',
});

const PermissionsAdminTypes = Object.freeze({
  PARTICIPANTS: 'participants',
  STREAMING: 'streaming',
  TRANSCRIPTION: 'transcription',
});

const ALL_PERMISSIONS = ['hasPresence', 'canSend', 'canReceive', 'canAdmin'];

const ALL_MEDIA_TYPES = Object.values(PermissionsMediaTypes);
const ALL_MINIFIED_MEDIA_TYPES = ['v', 'a', 'sv', 'sa', 'cv', 'ca'];
const MEDIA_TYPES_TO_MINIFIED_MEDIA_TYPES = Object.freeze(
  ALL_MEDIA_TYPES.reduce((obj, mediaType, index) => {
    obj[mediaType] = ALL_MINIFIED_MEDIA_TYPES[index];
    return obj;
  }, {})
);
const MINIFIED_MEDIA_TYPES_TO_MEDIA_TYPES = Object.freeze(
  ALL_MINIFIED_MEDIA_TYPES.reduce((obj, minifiedMediaType, index) => {
    obj[minifiedMediaType] = ALL_MEDIA_TYPES[index];
    return obj;
  }, {})
);
const NON_CUSTOM_MEDIA_TYPES = [
  PermissionsMediaTypes.VIDEO,
  PermissionsMediaTypes.AUDIO,
  PermissionsMediaTypes.SCREEN_VIDEO,
  PermissionsMediaTypes.SCREEN_AUDIO,
];

const ALL_ADMIN_TYPES = Object.values(PermissionsAdminTypes);
const ALL_MINIFIED_ADMIN_TYPES = ['p', 's', 't'];
const ADMIN_TYPES_TO_MINIFIED_ADMIN_TYPES = Object.freeze(
  ALL_ADMIN_TYPES.reduce((obj, adminType, index) => {
    obj[adminType] = ALL_MINIFIED_ADMIN_TYPES[index];
    return obj;
  }, {})
);
const MINIFIED_ADMIN_TYPES_TO_ADMIN_TYPES = Object.freeze(
  ALL_MINIFIED_ADMIN_TYPES.reduce((obj, minifiedAdminType, index) => {
    obj[minifiedAdminType] = ALL_ADMIN_TYPES[index];
    return obj;
  }, {})
);

// Error type that can be used when a client isn't permitted to do something
// based on insufficient Permissions.
export class PermissionsError extends Error {
  constructor(permissions, ...params) {
    super(...params);
    this.name = 'PermissionsError';
    this.permissions = permissions.toJSONObject();
  }
}

// canReceive permission object, containing:
// - base (a boolean or a FULL CanReceiveMediaPermission object)
// - byUserId (optional) (an object mapping between user id strings and booleans or PARTIAL CanReceiveMediaPermission objects)
// - byParticipantId (optional) (an object mapping between participant id strings and booleans or PARTIAL CanReceiveMediaPermission objects)
export class CanReceivePermission {
  // Constructs a new CanReceivePermission object.
  constructor({ base, byUserId, byParticipantId } = {}) {
    this.base = base;
    this.byUserId = byUserId;
    this.byParticipantId = byParticipantId;
  }

  // Returns a clone of this CanReceivePermission object.
  clone() {
    const permission = new CanReceivePermission();

    // base (assumed to exist)
    if (this.base instanceof CanReceiveMediaPermission) {
      permission.base = this.base.clone();
    } else {
      permission.base = this.base; // boolean
    }

    // byUserId
    if (this.byUserId !== undefined) {
      permission.byUserId = {};
      for (const userId in this.byUserId) {
        const value = this.byUserId[userId];
        if (value instanceof CanReceiveMediaPermission) {
          permission.byUserId[userId] = value.clone();
        } else {
          permission.byUserId[userId] = value; // boolean
        }
      }
    }

    // byParticipantId
    if (this.byParticipantId !== undefined) {
      permission.byParticipantId = {};
      for (const participantId in this.byParticipantId) {
        const value = this.byParticipantId[participantId];
        if (value instanceof CanReceiveMediaPermission) {
          permission.byParticipantId[participantId] = value.clone();
        } else {
          permission.byParticipantId[participantId] = value; // boolean
        }
      }
    }

    return permission;
  }

  // Returns a JSON representation of this CanReceivePermission object, useful for
  // transmitting over the wire.
  // Does not first normalize().
  toJSONObject() {
    let jsonObject = {};

    // base (assumed to exist)
    if (typeof this.base == 'boolean') {
      jsonObject.base = this.base;
    } else if (this.base instanceof CanReceiveMediaPermission) {
      jsonObject.base = this.base.toJSONObject();
    }

    // byUserId
    if (this.byUserId !== undefined) {
      jsonObject.byUserId = {};
      for (const userId in this.byUserId) {
        const value = this.byUserId[userId];
        if (value instanceof CanReceiveMediaPermission) {
          jsonObject.byUserId[userId] = value.toJSONObject();
        } else {
          jsonObject.byUserId[userId] = value; // boolean
        }
      }
    }

    // byParticipantId
    if (this.byParticipantId !== undefined) {
      jsonObject.byParticipantId = {};
      for (const participantId in this.byParticipantId) {
        const value = this.byParticipantId[participantId];
        if (value instanceof CanReceiveMediaPermission) {
          jsonObject.byParticipantId[participantId] = value.toJSONObject();
        } else {
          jsonObject.byParticipantId[participantId] = value; // boolean
        }
      }
    }

    return jsonObject;
  }

  static fromJSONObject(jsonObject) {
    // base
    let base;
    if (jsonObject.base !== undefined) {
      if (typeof jsonObject.base === 'boolean') {
        base = jsonObject.base;
      } else {
        base = CanReceiveMediaPermission.fromJSONObject(jsonObject.base);
      }
    }

    // byUserId
    let byUserId;
    if (jsonObject.byUserId !== undefined) {
      byUserId = {};
      for (const userId in jsonObject.byUserId) {
        const value = jsonObject.byUserId[userId];
        if (typeof value === 'boolean') {
          byUserId[userId] = value;
        } else {
          byUserId[userId] = CanReceiveMediaPermission.fromJSONObject(value);
        }
      }
    }

    // byParticipantId
    let byParticipantId;
    if (jsonObject.byParticipantId !== undefined) {
      byParticipantId = {};
      for (const participantId in jsonObject.byParticipantId) {
        const value = jsonObject.byParticipantId[participantId];
        if (typeof value === 'boolean') {
          byParticipantId[participantId] = value;
        } else {
          byParticipantId[participantId] =
            CanReceiveMediaPermission.fromJSONObject(value);
        }
      }
    }

    return new CanReceivePermission({ base, byUserId, byParticipantId });
  }

  toMinifiedJSONObject() {
    let minified = {};

    // base -> b
    if (this.base !== undefined) {
      if (typeof this.base === 'boolean') {
        minified.b = this.base;
      } else {
        minified.b = this.base.toMinifiedJSONObject();
      }
    }

    // byUserId -> u
    if (this.byUserId !== undefined) {
      minified.u = {};
      for (const userId in this.byUserId) {
        const value = this.byUserId[userId];
        if (typeof value === 'boolean') {
          minified.u[userId] = value;
        } else {
          minified.u[userId] = value.toMinifiedJSONObject();
        }
      }
    }

    // byParticipantId -> p
    if (this.byParticipantId !== undefined) {
      minified.p = {};
      for (const participantId in this.byParticipantId) {
        const value = this.byParticipantId[participantId];
        if (typeof value === 'boolean') {
          minified.p[participantId] = value;
        } else {
          minified.p[participantId] = value.toMinifiedJSONObject();
        }
      }
    }

    return minified;
  }

  static fromMinifiedJSONObject(minified) {
    // b -> base
    let base;
    if (minified.b !== undefined) {
      if (typeof minified.b === 'boolean') {
        base = minified.b;
      } else {
        base = CanReceiveMediaPermission.fromMinifiedJSONObject(minified.b);
      }
    }

    // u -> byUserId
    let byUserId;
    if (minified.u !== undefined) {
      byUserId = {};
      for (const userId in minified.u) {
        const value = minified.u[userId];
        if (typeof value === 'boolean') {
          byUserId[userId] = value;
        } else {
          byUserId[userId] =
            CanReceiveMediaPermission.fromMinifiedJSONObject(value);
        }
      }
    }

    // p -> byParticipantId
    let byParticipantId;
    if (minified.p !== undefined) {
      byParticipantId = {};
      for (const participantId in minified.p) {
        const value = minified.p[participantId];
        if (typeof value === 'boolean') {
          byParticipantId[participantId] = value;
        } else {
          byParticipantId[participantId] =
            CanReceiveMediaPermission.fromMinifiedJSONObject(value);
        }
      }
    }

    return new CanReceivePermission({ base, byUserId, byParticipantId });
  }

  normalize() {
    // base
    if (this.base instanceof CanReceiveMediaPermission) {
      this.base = this.base.normalize();
    }

    // byUserId
    if (this.byUserId) {
      this.byUserId = Object.fromEntries(
        Object.entries(this.byUserId).map(([key, value]) => [
          key,
          value instanceof CanReceiveMediaPermission
            ? value.normalize()
            : value,
        ])
      );
    }

    // byParticipantId
    if (this.byParticipantId) {
      this.byParticipantId = Object.fromEntries(
        Object.entries(this.byParticipantId).map(([key, value]) => [
          key,
          value instanceof CanReceiveMediaPermission
            ? value.normalize()
            : value,
        ])
      );
    }

    return this;
  }

  static validateJSONObject(jsonObject) {
    if (typeof jsonObject !== 'object') {
      return [false, 'canReceive must be an object'];
    }
    const validKeys = ['base', 'byUserId', 'byParticipantId'];
    for (const key of Object.keys(jsonObject)) {
      if (!validKeys.includes(key)) {
        return [
          false,
          `canReceive can only contain keys (${validKeys.join(', ')})`,
        ];
      } else if (key === 'base') {
        const [isValid, invalidityReason] =
          CanReceiveMediaPermission.validateJSONObject(
            jsonObject.base,
            true // isBase
          );
        if (!isValid) {
          return [false, invalidityReason];
        }
      } else {
        // byUserId/byParticipantId
        if (typeof jsonObject[key] !== 'object') {
          return [
            false,
            `invalid (non-object) value for field '${key}' in canReceive`,
          ];
        }
        for (const value of Object.values(jsonObject[key])) {
          const [isValid, invalidityReason] =
            CanReceiveMediaPermission.validateJSONObject(value);
          if (!isValid) {
            return [false, invalidityReason];
          }
        }
      }
    }
    return [true];
  }
}

// canReceive permission for a specific user id, participant id, or "base", containing:
// - video (a boolean)
// - audio (a boolean)
// - screenVideo (a boolean)
// - screenAudio (a boolean)
// - customVideo (a Mapping between track names or "*" and a boolean)
// - customAudio (a Mapping between track names or "*" and a boolean)
// When used as the "base" permission, all of the above fields are required, and furthermore
// customVideo and customAudio must include "*" entries.
// When used as permission for a specific user or participant id, all of the above fields are optional.
export class CanReceiveMediaPermission {
  // Constructs a new CanReceivePermission object.
  // Assumes the provided per-media permissions are valid, per their description in the
  // class-level comment.
  constructor({
    video,
    audio,
    screenVideo,
    screenAudio,
    customVideo,
    customAudio,
  } = {}) {
    // These properties are assumed to map to PermissionMediaTypes
    this.video = video;
    this.audio = audio;
    this.screenVideo = screenVideo;
    this.screenAudio = screenAudio;
    this.customVideo = customVideo;
    this.customAudio = customAudio;
  }

  static fromBoolean(bool) {
    return new CanReceiveMediaPermission({
      video: bool,
      audio: bool,
      screenVideo: bool,
      screenAudio: bool,
      customVideo: { '*': bool },
      customAudio: { '*': bool },
    });
  }

  static fromJSONObject(jsonObject) {
    return new CanReceiveMediaPermission({
      video: jsonObject.video,
      audio: jsonObject.audio,
      screenVideo: jsonObject.screenVideo,
      screenAudio: jsonObject.screenAudio,
      customVideo:
        jsonObject.customVideo !== undefined
          ? { ...jsonObject.customVideo }
          : undefined,
      customAudio:
        jsonObject.customAudio !== undefined
          ? { ...jsonObject.customAudio }
          : undefined,
    });
  }

  // Returns a clone of this CanReceivePermissions object.
  clone() {
    const permission = new CanReceiveMediaPermission();

    if (this.video !== undefined) {
      permission.video = this.video;
    }
    if (this.audio !== undefined) {
      permission.audio = this.audio;
    }
    if (this.screenVideo !== undefined) {
      permission.screenVideo = this.screenVideo;
    }
    if (this.screenAudio !== undefined) {
      permission.screenAudio = this.screenAudio;
    }
    if (this.customVideo !== undefined) {
      permission.customVideo = { ...this.customVideo };
    }
    if (this.customAudio !== undefined) {
      permission.customAudio = { ...this.customAudio };
    }

    return permission;
  }

  // Returns a JSON representation of this CanReceiveMediaPermission object, useful for
  // transmitting over the wire.
  // Does not first normalize().
  toJSONObject() {
    let jsonObject = {};

    if (this.video !== undefined) {
      jsonObject.video = this.video;
    }
    if (this.audio !== undefined) {
      jsonObject.audio = this.audio;
    }
    if (this.screenVideo !== undefined) {
      jsonObject.screenVideo = this.screenVideo;
    }
    if (this.screenAudio !== undefined) {
      jsonObject.screenAudio = this.screenAudio;
    }
    if (this.customVideo !== undefined) {
      jsonObject.customVideo = { ...this.customVideo };
    }
    if (this.customAudio !== undefined) {
      jsonObject.customAudio = { ...this.customAudio };
    }

    return jsonObject;
  }

  toMinifiedJSONObject() {
    let minified = {};

    if (this.video !== undefined) {
      minified.v = this.video;
    }
    if (this.audio !== undefined) {
      minified.a = this.audio;
    }
    if (this.screenVideo !== undefined) {
      minified.sv = this.screenVideo;
    }
    if (this.screenAudio !== undefined) {
      minified.sa = this.screenAudio;
    }
    if (this.customVideo !== undefined) {
      minified.cv = { ...this.customVideo };
    }
    if (this.customAudio !== undefined) {
      minified.ca = { ...this.customAudio };
    }

    return minified;
  }

  static fromMinifiedJSONObject(minified) {
    return new CanReceiveMediaPermission({
      video: minified.v,
      audio: minified.a,
      screenVideo: minified.sv,
      screenAudio: minified.sa,
      customVideo: minified.cv,
      customAudio: minified.ca,
    });
  }

  normalize() {
    function customCanBeReducedToBool(property, bool) {
      return (
        property && Object.keys(property).length === 1 && property['*'] === bool
      );
    }
    if (
      this.video === true &&
      this.audio === true &&
      this.screenVideo === true &&
      this.screenAudio === true &&
      customCanBeReducedToBool(this.customVideo, true) &&
      customCanBeReducedToBool(this.customAudio, true)
    ) {
      return true;
    }
    if (
      this.video === false &&
      this.audio === false &&
      this.screenVideo === false &&
      this.screenAudio === false &&
      customCanBeReducedToBool(this.customVideo, false) &&
      customCanBeReducedToBool(this.customAudio, false)
    ) {
      return false;
    }
    return this;
  }

  // Note: boolean also counts as a JSON object, here
  // Returns a two-item array:
  // - a boolean indicating whether the object is valid
  // - a string describing why the validation failed (or null if valid)
  static validateJSONObject(json, isBase) {
    // Boolean is always valid
    if (typeof json === 'boolean') {
      return [true];
    }

    // If not boolean, must be an object
    if (typeof json !== 'object') {
      return [false, 'invalid (non-object, non-boolean) value in canReceive'];
    }

    // Check each field
    const keys = Object.keys(json);
    for (const key of keys) {
      if (!ALL_MEDIA_TYPES.includes(key)) {
        return [false, `invalid media type '${key}' in canReceive`];
      } else if (NON_CUSTOM_MEDIA_TYPES.includes(key)) {
        if (typeof json[key] !== 'boolean') {
          return [
            false,
            `invalid (non-boolean) value for media type '${key}' in canReceive`,
          ];
        }
      } else {
        // custom video/audio
        if (typeof json[key] !== 'object') {
          return [
            false,
            `invalid (non-object) value for media type '${key}' in canReceive`,
          ];
        }
        for (const value of Object.values(json[key])) {
          if (typeof value !== 'boolean') {
            return [
              false,
              `invalid (non-boolean) value for entry within '${key}' in canReceive`,
            ];
          }
        }
        // If this CanReceiveMediaPermission represents the "base" part of a CanReceivePermission,
        // its customVideo/customAudio must contain "*"
        if (isBase && json[key]['*'] === undefined) {
          return [
            false,
            `canReceive "base" permission must specify "*" as an entry within '${key}'`,
          ];
        }
      }
    }

    // If this CanReceiveMediaPermission represents the "base" part of a CanReceivePermission, it
    // must contain *all* media types
    if (isBase && !(keys.length === ALL_MEDIA_TYPES.length)) {
      return [
        false,
        `canReceive "base" permission must specify all media types: ${ALL_MEDIA_TYPES.join(
          ', '
        )} (or be set to a boolean shorthand)`,
      ];
    }

    return [true];
  }
}

// Participant permissions object, currently containing four permissions:
// - hasPresence (a boolean)
// - canSend (a boolean or a Set of PermissionsMediaTypes)
// - canReceive (a CanReceivePermission object)
// - canAdmin (a boolean or a Set of PermissionsAdminTypes)
// Note that the Permissions object can be used for representing "partial"
// permissions, with one or all of the above permissions being undefined, as in
// the case of token-provided permissions.
export class Permissions {
  // Constructs a new Permissions object.
  // Assumes the provided permissions are valid, per their description in the
  // class-level comment.
  constructor({ hasPresence, canSend, canReceive, canAdmin } = {}) {
    this.hasPresence = hasPresence;
    this.canSend = canSend;
    this.canReceive = canReceive;
    this.canAdmin = canAdmin;
  }

  // Returns a clone of this Permissions object.
  clone() {
    const permissions = new Permissions();
    if (this.hasPresence !== undefined) {
      permissions.hasPresence = this.hasPresence;
    }
    if (this.canSend !== undefined) {
      if (this.canSend instanceof Set) {
        permissions.canSend = new Set(this.canSend);
      } else {
        permissions.canSend = this.canSend;
      }
    }
    if (this.canReceive !== undefined) {
      permissions.canReceive = this.canReceive.clone();
    }
    if (this.canAdmin !== undefined) {
      if (this.canAdmin instanceof Set) {
        permissions.canAdmin = new Set(this.canAdmin);
      } else {
        permissions.canAdmin = this.canAdmin;
      }
    }
    return permissions;
  }

  // Returns whether these Permissions allow sending a track with the given
  // media tag (e.g. 'cam-video', 'my-custom-media') and kind (e.g. 'video').
  // Kind is only needed for custom tracks.
  canSendTrack(mediaTag, kind) {
    if (this.canSend === true) {
      return true;
    }

    if (this.canSend instanceof Set) {
      switch (mediaTag) {
        case 'cam-video':
          return this.canSend.has(PermissionsMediaTypes.VIDEO);
        case 'cam-audio':
          return this.canSend.has(PermissionsMediaTypes.AUDIO);
        case 'screen-video':
          return this.canSend.has(PermissionsMediaTypes.SCREEN_VIDEO);
        case 'screen-audio':
          return this.canSend.has(PermissionsMediaTypes.SCREEN_AUDIO);
        default:
          // Custom track
          if (kind === 'video') {
            return this.canSend.has(PermissionsMediaTypes.CUSTOM_VIDEO);
          } else if (kind === 'audio') {
            return this.canSend.has(PermissionsMediaTypes.CUSTOM_AUDIO);
          }
          return false;
      }
    }

    // Shouldn't ever get here; we expect to only query permissions on complete Permissions objects
    return false;
  }

  // Returns whether these Permissions allow receiving a track with the given
  // media tag (e.g. 'cam-video', 'my-custom-media') and kind (e.g. 'video')
  // from a participant with a given ID and (optionally) userId.
  canReceiveTrack(mediaTag, kind, participantId, userId) {
    if (this.canReceive === undefined) {
      // Shouldn't ever get here; we expect to only query permissions on complete Permissions objects
      return false;
    }

    // Get participant-id-specific settings, if any
    let participantIdSettings =
      this.canReceive.byParticipantId?.[participantId];
    if (typeof participantIdSettings === 'boolean') {
      participantIdSettings = CanReceiveMediaPermission.fromBoolean(
        participantIdSettings
      );
    }

    // Get user-id-specific settings, if any
    let userIdSettings = this.canReceive.byUserId?.[userId];
    if (typeof userIdSettings === 'boolean') {
      userIdSettings = CanReceiveMediaPermission.fromBoolean(userIdSettings);
    }

    // Get base settings
    let baseSettings = this.canReceive.base;
    if (typeof baseSettings === 'boolean') {
      baseSettings = CanReceiveMediaPermission.fromBoolean(baseSettings);
    }

    // Prepare to check settings
    let settingsKey;
    let customTrackName;
    switch (mediaTag) {
      case 'cam-video':
        settingsKey = PermissionsMediaTypes.VIDEO;
        break;
      case 'cam-audio':
        settingsKey = PermissionsMediaTypes.AUDIO;
        break;
      case 'screen-video':
        settingsKey = PermissionsMediaTypes.SCREEN_VIDEO;
        break;
      case 'screen-audio':
        settingsKey = PermissionsMediaTypes.SCREEN_AUDIO;
        break;
      default:
        // Custom track
        if (kind === 'video') {
          settingsKey = PermissionsMediaTypes.CUSTOM_VIDEO;
          customTrackName = mediaTag;
        } else if (kind === 'audio') {
          settingsKey = PermissionsMediaTypes.CUSTOM_AUDIO;
          customTrackName = mediaTag;
        } else if (kind === 'unknown') {
          settingsKey = 'custom-unknown';
          customTrackName = mediaTag;
        }
        break;
    }

    // Check each settings object, in this priority order:
    // - participant-id-specific (most important)
    // - user-id-specific
    // - base (least important)
    // Note that != instead of !== is intentional below, checking against null or undefined.
    if (!customTrackName) {
      // participant-id-specific
      if (participantIdSettings?.[settingsKey] != null) {
        return participantIdSettings[settingsKey];
      }
      // user-id-specific
      if (userIdSettings?.[settingsKey] != null) {
        return userIdSettings[settingsKey];
      }
      // base (assume base settings has key, because it's guaranteed to be full and not partial settings)
      return baseSettings[settingsKey];
    } else {
      // if kind is 'unknown', be maximally *permissive*, checking both custom video and audio
      // settings, and returning true if *either* is permitted.
      // this is only used client-side, so this permissiveness is OK; if the client is not
      // permitted to receive a track, the server will deny it appropriately.
      const settingsKeys =
        settingsKey === 'custom-unknown'
          ? [
              PermissionsMediaTypes.CUSTOM_VIDEO,
              PermissionsMediaTypes.CUSTOM_AUDIO,
            ]
          : [settingsKey];
      let permitted = false;
      for (const settingsKey of settingsKeys) {
        // participant-id-specific
        let customTracksSetting = participantIdSettings?.[settingsKey];
        if (customTracksSetting != null) {
          if (customTracksSetting[customTrackName] != null) {
            permitted = permitted || customTracksSetting[customTrackName];
            continue;
          } else if (customTracksSetting['*'] != null) {
            permitted = permitted || customTracksSetting['*'];
            continue;
          }
        }
        // user-id-specific
        customTracksSetting = userIdSettings?.[settingsKey];
        if (customTracksSetting != null) {
          if (customTracksSetting[customTrackName] != null) {
            permitted = permitted || customTracksSetting[customTrackName];
            continue;
          } else if (customTracksSetting['*'] != null) {
            permitted = permitted || customTracksSetting['*'];
            continue;
          }
        }
        // base (assume base settings has key as well as "*" entry, because it's guaranteed to be full and not partial settings)
        customTracksSetting = baseSettings[settingsKey];
        if (customTracksSetting[customTrackName] != null) {
          permitted = permitted || customTracksSetting[customTrackName];
          continue;
        }
        permitted = permitted || customTracksSetting['*'];
      }
      return permitted;
    }
  }

  isParticipantAdmin() {
    if (this.canAdmin === true) {
      return true;
    }

    if (this.canAdmin instanceof Set) {
      return this.canAdmin.has(PermissionsAdminTypes.PARTICIPANTS);
    }

    // Shouldn't ever get here; we expect to only query permissions on complete Permissions objects
    return false;
  }

  isStreamingAdmin() {
    if (this.canAdmin === true) {
      return true;
    }

    if (this.canAdmin instanceof Set) {
      return this.canAdmin.has(PermissionsAdminTypes.STREAMING);
    }

    // Shouldn't ever get here; we expect to only query permissions on complete Permissions objects
    return false;
  }

  isTranscriptionAdmin() {
    if (this.canAdmin === true) {
      return true;
    }

    if (this.canAdmin instanceof Set) {
      return this.canAdmin.has(PermissionsAdminTypes.TRANSCRIPTION);
    }

    // Shouldn't ever get here; we expect to only query permissions on complete Permissions objects
    return false;
  }

  // Returns whether these Permissions allow remote-muting other participants.
  canRemoteMuteParticipants() {
    return this.isParticipantAdmin();
  }

  // Returns whether these Permissions allow ejecting another participant.
  canRemoteEjectParticipant(remotePermissions, localIsOwner) {
    // Owners can eject all participants.
    // (Ideally this would be "owners can eject all non-owner participants" but
    // this is how it was before participant admin permissions were implemented;
    // let's not rock the boat and risk breaking existing customers).
    if (localIsOwner) {
      return true;
    }
    // Non-owner participant admins can eject other participants who are not
    // themselves participant admins.
    // (Note that if for some reason we don't have remotePermissions, we assume
    // we *can* eject them; on the "ejectee"'s side there is logic to double-
    // check whether the ejection is allowed before taking any action)
    else {
      return (
        this.isParticipantAdmin() && !remotePermissions?.isParticipantAdmin()
      );
    }
  }

  // Returns a two-item array:
  // - a boolean indicating whether the remote permissions update is allowed
  // - a string describing why the update is not allowed (or null if it is)
  // NOTE: "remote" below might be yourself!
  canRemoteUpdatePermissions(
    remotePermissions,
    remoteIsOwner,
    localIsOwner,
    isSelfUpdate,
    proposedUpdate
  ) {
    // Non-participant admins aren't allowed to update anyone's permissions
    if (!this.isParticipantAdmin()) {
      return [
        false,
        "must have 'participants' canAdmin permission to update another's permissions",
      ];
    }

    // Check whether we have a restriction around revoking participant admin
    // permission (i.e. the 'participants' value of canAdmin) - you're allowed
    // to revoke participant admin permissions if:
    // - it's not on an owner (even if it's yourself), and either
    //   - it's on yourself, or
    //   - you're an owner
    // Put another way: if you're an owner you can revoke participant admin
    // permission on any non-owners. If you're a non-owner participant admin,
    // you can revoke participant admin permission on yourself only.
    // (Why can't owners revoke their own participant admin permission? It's the
    // fundamental permission that lets them gain any other; we don't want them
    // to end up dead in the water).
    let allowedToRevokeParticipantAdminPermission = true;
    let disallowedToRevokeParticipantAdminReason = null;
    if (remoteIsOwner) {
      allowedToRevokeParticipantAdminPermission = false;
      disallowedToRevokeParticipantAdminReason =
        "cannot revoke an owner's 'participants' canAdmin permission";
    } else if (!isSelfUpdate && !localIsOwner) {
      allowedToRevokeParticipantAdminPermission = false;
      disallowedToRevokeParticipantAdminReason =
        "non-owners cannot revoke another participant admin's 'participants' canAdmin permission";
    }

    // Check whether this update constitutes a disallowed revocation of
    // participant admin permissions
    if (
      !allowedToRevokeParticipantAdminPermission &&
      remotePermissions.isParticipantAdmin()
    ) {
      const previewPermissions = remotePermissions.clone();
      previewPermissions.update(proposedUpdate);
      if (!previewPermissions.isParticipantAdmin()) {
        return [false, disallowedToRevokeParticipantAdminReason];
      }
    }

    // Any other update is allowed!
    return [true, null];
  }

  canAdmitWaitingParticipants() {
    return this.isParticipantAdmin();
  }

  // Returns whether these permissions require being in SFU mode to work.
  requiresSFUMode() {
    // Hidden participants don't work in P2P mode today, where the info peers
    // need to connect to each other is tangled up in presence.
    return this.hasPresence === false;
  }

  // Update (possibly partial) permissions, using another (possibly partial) Permissions object.
  // Returns whether any permissions have changed.
  update(newPermissions) {
    let permissionsDidChange = false;

    if (
      newPermissions.hasPresence !== undefined &&
      this.hasPresence !== newPermissions.hasPresence
    ) {
      this.hasPresence = newPermissions.hasPresence;
      permissionsDidChange = true;
    }

    if (
      newPermissions.canSend !== undefined &&
      !dequal(this.canSend, newPermissions.canSend)
    ) {
      this.canSend = newPermissions.canSend;
      permissionsDidChange = true;
    }

    // with canReceive we do a 1-level-deeper update than other permissions.
    // rather than replacing canReceive wholesale, we replace base, byUserId, byParticipantId.
    if (newPermissions.canReceive !== undefined) {
      if (
        newPermissions.canReceive.base !== undefined &&
        !dequal(this.canReceive?.base, newPermissions.canReceive.base)
      ) {
        if (this.canReceive === undefined) {
          this.canReceive = new CanReceivePermission();
        }
        this.canReceive.base = newPermissions.canReceive.base;
        permissionsDidChange = true;
      }
      if (
        newPermissions.canReceive.byUserId !== undefined &&
        !dequal(this.canReceive?.byUserId, newPermissions.canReceive.byUserId)
      ) {
        if (this.canReceive === undefined) {
          this.canReceive = new CanReceivePermission();
        }
        this.canReceive.byUserId = newPermissions.canReceive.byUserId;
        permissionsDidChange = true;
      }
      if (
        newPermissions.canReceive.byParticipantId !== undefined &&
        !dequal(
          this.canReceive?.byParticipantId,
          newPermissions.canReceive.byParticipantId
        )
      ) {
        if (this.canReceive === undefined) {
          this.canReceive = new CanReceivePermission();
        }
        this.canReceive.byParticipantId =
          newPermissions.canReceive.byParticipantId;
        permissionsDidChange = true;
      }
    }

    if (
      newPermissions.canAdmin !== undefined &&
      !dequal(this.canAdmin, newPermissions.canAdmin)
    ) {
      this.canAdmin = newPermissions.canAdmin;
      permissionsDidChange = true;
    }

    return permissionsDidChange;
  }

  // Returns a JSON representation of this Permissions object, useful for
  // transmitting over the wire.
  // Does not first normalize().
  toJSONObject() {
    let jsonObject = {};

    // hasPresence
    if (this.hasPresence !== undefined) {
      jsonObject.hasPresence = this.hasPresence;
    }

    // canSend
    if (typeof this.canSend === 'boolean') {
      jsonObject.canSend = this.canSend;
    } else if (this.canSend instanceof Set) {
      jsonObject.canSend = [...this.canSend];
    }

    // canReceive
    if (this.canReceive !== undefined) {
      jsonObject.canReceive = this.canReceive.toJSONObject();
    }

    // canAdmin
    if (typeof this.canAdmin === 'boolean') {
      jsonObject.canAdmin = this.canAdmin;
    } else if (this.canAdmin instanceof Set) {
      jsonObject.canAdmin = [...this.canAdmin];
    }

    return jsonObject;
  }

  // Returns a Permissions object from a JSON object representation, obtained
  // from toJSONObject().
  // Assumes jsonObject is valid.
  // Does not normalize().
  static fromJSONObject(jsonObject) {
    // hasPresence
    const hasPresence = jsonObject.hasPresence;

    // canSend
    let canSend;
    if (typeof jsonObject.canSend === 'boolean') {
      canSend = jsonObject.canSend;
    } else if (Array.isArray(jsonObject.canSend)) {
      canSend = new Set(jsonObject.canSend);
    }

    // canReceive
    let canReceive;
    if (jsonObject.canReceive !== undefined) {
      canReceive = CanReceivePermission.fromJSONObject(jsonObject.canReceive);
    }

    // canAdmin
    let canAdmin;
    if (typeof jsonObject.canAdmin === 'boolean') {
      canAdmin = jsonObject.canAdmin;
    } else if (Array.isArray(jsonObject.canAdmin)) {
      canAdmin = new Set(jsonObject.canAdmin);
    }

    return new Permissions({ hasPresence, canSend, canReceive, canAdmin });
  }

  // Returns a minified JSON object representation of this Permissions object,
  // useful for storing in a token.
  // Does not first normalize().
  toMinifiedJSONObject() {
    let minified = {};

    // hasPresence -> hp
    if (this.hasPresence !== undefined) {
      minified.hp = this.hasPresence;
    }

    // canSend -> cs
    if (typeof this.canSend === 'boolean') {
      minified.cs = this.canSend;
    } else if (this.canSend instanceof Set) {
      minified.cs = [...this.canSend]
        .map((mediaType) => MEDIA_TYPES_TO_MINIFIED_MEDIA_TYPES[mediaType])
        .join(',');
    }

    // canReceive -> cr
    if (this.canReceive !== undefined) {
      minified.cr = this.canReceive.toMinifiedJSONObject();
    }

    // canAdmin -> ca
    if (typeof this.canAdmin === 'boolean') {
      minified.ca = this.canAdmin;
    } else if (this.canAdmin instanceof Set) {
      minified.ca = [...this.canAdmin]
        .map((adminType) => ADMIN_TYPES_TO_MINIFIED_ADMIN_TYPES[adminType])
        .join(',');
    }

    return minified;
  }

  // Returns a Permissions object from a minified JSON object representation,
  // obtained from toMinifiedJSONObject.
  // Assumes minified is valid.
  // Does not normalize().
  static fromMinifiedJSONObject(minified) {
    // hp -> hasPresence
    const hasPresence = minified.hp;

    // cs -> canSend
    let canSend;
    if (typeof minified.cs === 'boolean') {
      canSend = minified.cs;
    } else if (typeof minified.cs === 'string') {
      canSend = new Set(
        minified.cs
          .split(',')
          .map(
            (minifiedMediaType) =>
              MINIFIED_MEDIA_TYPES_TO_MEDIA_TYPES[minifiedMediaType]
          )
      );
    }

    // cr -> canReceive
    let canReceive;
    if (minified.cr !== undefined) {
      canReceive = CanReceivePermission.fromMinifiedJSONObject(minified.cr);
    }

    // ca -> canAdmin
    let canAdmin;
    if (typeof minified.ca === 'boolean') {
      canAdmin = minified.ca;
    } else if (typeof minified.ca === 'string') {
      canAdmin = new Set(
        minified.ca
          .split(',')
          .map(
            (minifiedAdminType) =>
              MINIFIED_ADMIN_TYPES_TO_ADMIN_TYPES[minifiedAdminType]
          )
      );
    }

    return new Permissions({ hasPresence, canSend, canReceive, canAdmin });
  }

  // Normalizes permissions.
  // (e.g. converts `canSend: <Set of all media types>` into `canSend: true`).
  // This is useful for processing a set of permissions from a customer, who
  // may not provide them in the normalized way.
  normalize() {
    // canSend
    if (this.canSend instanceof Set) {
      if (
        this.canSend.size === ALL_MEDIA_TYPES.length &&
        ALL_MEDIA_TYPES.every((mediaType) => this.canSend.has(mediaType))
      ) {
        this.canSend = true;
      } else if (this.canSend.size === 0) {
        this.canSend = false;
      }
    }

    // canReceive
    if (this.canReceive !== undefined) {
      this.canReceive = this.canReceive.normalize();
    }

    // canAdmin
    if (this.canAdmin instanceof Set) {
      if (
        this.canAdmin.size === ALL_ADMIN_TYPES.length &&
        ALL_ADMIN_TYPES.every((adminType) => this.canAdmin.has(adminType))
      ) {
        this.canAdmin = true;
      } else if (this.canAdmin.size === 0) {
        this.canAdmin = false;
      }
    }

    return this;
  }

  // Validates a JSON object representation of permissions.
  // Returns a two-item array:
  // - a boolean indicating whether the object is valid
  // - a string describing why the validation failed (or null if valid)
  static validateJSONObject(
    jsonObject,
    { allowPartialPermissions = true } = {}
  ) {
    if (typeof jsonObject !== 'object') {
      return [false, 'must be an object'];
    }

    for (const [permissionName, permission] of Object.entries(jsonObject)) {
      switch (permissionName) {
        case 'hasPresence':
          if (typeof permission !== 'boolean') {
            return [false, 'hasPresence must be a boolean'];
          }
          break;
        case 'canSend':
          if (Array.isArray(permission)) {
            for (const mediaType of permission) {
              if (!ALL_MEDIA_TYPES.includes(mediaType)) {
                return [
                  false,
                  `canSend can only contain items in the set (${ALL_MEDIA_TYPES.join(
                    ', '
                  )})`,
                ];
              }
            }
          } else if (typeof permission !== 'boolean') {
            return [false, 'canSend must be an array or boolean'];
          }
          break;
        case 'canReceive': {
          const [isValid, invalidityReason] =
            CanReceivePermission.validateJSONObject(permission);
          if (!isValid) {
            return [false, invalidityReason];
          }
          break;
        }
        case 'canAdmin':
          if (Array.isArray(permission)) {
            for (const adminType of permission) {
              if (!ALL_ADMIN_TYPES.includes(adminType)) {
                return [
                  false,
                  `canAdmin can only contain items in the set (${ALL_ADMIN_TYPES.join(
                    ', '
                  )})`,
                ];
              }
            }
          } else if (typeof permission !== 'boolean') {
            return [false, 'canAdmin must be an array or boolean'];
          }
          break;
        default:
          return [false, `unrecognized permission name '${permissionName}'`];
      }
    }

    if (
      !allowPartialPermissions &&
      Object.keys(jsonObject).length < ALL_PERMISSIONS.length
    ) {
      return [
        false,
        `must specify ALL permissions: ${ALL_PERMISSIONS.join(', ')}`,
      ];
    }

    return [true];
  }

  // Owner-level permissions.
  // (Also used by synthetic participants today).
  static owner(tokenPermissions) {
    const permissions = new Permissions({
      hasPresence: true,
      canSend: true,
      canReceive: new CanReceivePermission({ base: true }),
      canAdmin: true,
    });

    if (tokenPermissions) {
      // Inject participant admin permissions if needed: owners must *always*
      // have participant admin privileges (see canRemoteUpdatePermissions()
      // for more details on this requirement).
      if (tokenPermissions.canAdmin === false) {
        tokenPermissions.canAdmin = new Set([
          PermissionsAdminTypes.PARTICIPANTS,
        ]);
      } else if (tokenPermissions.canAdmin instanceof Set) {
        tokenPermissions.canAdmin.add(PermissionsAdminTypes.PARTICIPANTS);
      }

      // Update with token permissions
      permissions.update(tokenPermissions);
    }

    return permissions;
  }
}
