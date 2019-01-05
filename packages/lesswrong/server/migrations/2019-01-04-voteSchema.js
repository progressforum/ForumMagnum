import { Votes } from '../../lib/collections/votes';
import { registerMigration, migrateDocuments } from './migrationUtils';
import { Collections } from 'meteor/vulcan:core';

registerMigration({
  name: "migrateVotes",
  idempotent: true,
  action: () => {
    migrateDocuments({
      description: "Fill in authorId field",
      collection: Votes,
      batchSize: 100,
      unmigratedDocumentQuery: {
        authorId: {$exists:false},
      },
      migrate: async (documents) => {
        // Get the set of collections that at least one vote in the batch
        // is voting on
        const collectionNames = _.uniq(_.pluck(documents, "collectionName"))
        
        for(let collectionName of collectionNames) {
          const collection = _.find(Collections, c => c.collectionName==collectionName);
          
          // Go through the votes in the batch and pick out IDs of voted-on
          // documents in this collection.
          const votesToUpdate = _.filter(documents, doc => doc.collectionName==collectionName)
          const idsToFind = _.pluck(votesToUpdate, "documentId");
          
          // Retrieve the voted-on documents.
          const votedDocuments = collection.find({
            _id: {$in: idsToFind}
          }).fetch();
          
          // Extract author IDs from the voted-on documents.
          let authorIdsByDocument = {};
          _.each(votedDocuments, doc => authorIdsByDocument[doc._id] = doc.userId);
          
          // Fill in authorId on the votes.
          const updates = _.map(votesToUpdate, vote => {
            return {
              updateOne: {
                filter: {_id: vote._id},
                update: {
                  $set: {
                    authorId: authorIdsByDocument[vote.documentId]
                  }
                },
                upsert: false,
              }
            };
          });
          let bulkWriteResult = await Votes.rawCollection().bulkWrite(
            updates,
            { ordered: false }
          );
        }
      },
    });
  },
});
