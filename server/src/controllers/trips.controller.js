import * as tripsService from '../services/trips.service.js';

export async function createTrip(req, res, next) {
  try {
    const trip = await tripsService.createTrip(req.auth.userId, req.body);
    return res.status(201).json({ success: true, data: trip });
  } catch (error) {
    return next(error);
  }
}

export async function getMyTrips(req, res, next) {
  try {
    const trips = await tripsService.getTripsByUser(req.auth.userId);
    return res.status(200).json({ success: true, data: trips });
  } catch (error) {
    return next(error);
  }
}

export async function getTrip(req, res, next) {
  try {
    const trip = await tripsService.getTripById(req.params.id, req.auth.userId);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    return res.status(200).json({ success: true, data: trip });
  } catch (error) {
    return next(error);
  }
}

export async function getPublicTrip(req, res, next) {
  try {
    const trip = await tripsService.getPublicTripById(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    return res.status(200).json({ success: true, data: trip });
  } catch (error) {
    return next(error);
  }
}

export async function updateTrip(req, res, next) {
  try {
    const trip = await tripsService.updateTrip(req.params.id, req.auth.userId, req.body);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    return res.status(200).json({ success: true, data: trip });
  } catch (error) {
    return next(error);
  }
}

export async function deleteTrip(req, res, next) {
  try {
    const trip = await tripsService.deleteTrip(req.params.id, req.auth.userId);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    return res.status(200).json({ success: true, message: 'Trip deleted.' });
  } catch (error) {
    return next(error);
  }
}