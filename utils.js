const EBS_SECRET_MANAGER_KEY_NAME = "ebs_dev";

const DB_SOURCES = {
    EBS: "EBS"
}

const DB_SOURCES_SECRET_KEY = {
    [DB_SOURCES.EBS]: EBS_SECRET_MANAGER_KEY_NAME
}

const Utils = {
    EBS_SECRET_MANAGER_KEY_NAME,
    DB_SOURCES_SECRET_KEY,
    DB_SOURCES
};

module.exports = Utils;
