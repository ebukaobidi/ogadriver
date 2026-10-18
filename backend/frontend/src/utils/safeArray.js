export const safeArray = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (val.data && Array.isArray(val.data)) return val.data;
  if (val.data && val.data.data && Array.isArray(val.data.data)) return val.data.data;
  if (val.proposals && Array.isArray(val.proposals)) return val.proposals;
  if (val.contracts && Array.isArray(val.contracts)) return val.contracts;
  if (val.rides && Array.isArray(val.rides)) return val.rides;
  if (val.jobs && Array.isArray(val.jobs)) return val.jobs;
  if (val.plans && Array.isArray(val.plans)) return val.plans;
  if (val.ratings && Array.isArray(val.ratings)) return val.ratings;
  if (val.transactions && Array.isArray(val.transactions)) return val.transactions;
  if (val.documents && Array.isArray(val.documents)) return val.documents;
  if (val.modules && Array.isArray(val.modules)) return val.modules;
  if (val.questions && Array.isArray(val.questions)) return val.questions;
  if (val.zones && Array.isArray(val.zones)) return val.zones;
  if (val.leaderboard && Array.isArray(val.leaderboard)) return val.leaderboard;
  return [];
};

export default safeArray;
