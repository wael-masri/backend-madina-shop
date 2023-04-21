
const errorOutsideExpress = (server) => {
    process.on("unhandledRejection", (err) => {
        console.error(`unhandledRejection error:${err.name} | ${err.message}`);
        server.close(() => {
          console.error(`shutting down.... `);
          process.exit(1);
        });
      });
  };

  module.exports = errorOutsideExpress;