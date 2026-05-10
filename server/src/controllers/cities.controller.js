import * as citiesService from '../services/cities.service.js';

export async function searchCities(req, res, next) {
  try {
    const data = await citiesService.searchCities(req.query);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}